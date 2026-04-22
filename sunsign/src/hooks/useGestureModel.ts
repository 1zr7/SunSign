import { useEffect, useState, useRef, useCallback } from 'react';
import type * as TF from '@tensorflow/tfjs';
import type { Results } from '@mediapipe/hands';

// The three ways to detect signs based on the selected mode:
// 'static' — Uses landmark data for letters (32 classes).
// 'tcn'    — Uses sequences of frames for words (32 classes).
// 'rgb'    — Uses the raw camera feed for 190 different signs.
export type ModelConfig = 'static' | 'dual_lstm' | 'combined';

export interface GesturePrediction {
  type: 'letter' | 'word';
  label: string;
  confidence: number;
}

interface LabelEntry {
  name: string;
  arabic: string;
}

interface ModelPaths {
  staticModel:     string | null;
  staticLabelMap:  string | null;
  dynamicModel:    string | null;
  dynamicLabelMap: string | null;
}

const MODEL_PATHS: Record<ModelConfig, ModelPaths> = {
  static: {
    staticModel:     '/model/model.json',
    staticLabelMap:  '/model/label_map.json',
    dynamicModel:    null,
    dynamicLabelMap: null,
  },
  dual_lstm: {
    staticModel:     null,
    staticLabelMap:  null,
    dynamicModel:    '/model_dual_lstm/model.json',
    dynamicLabelMap: '/model_dual_lstm/label_map_dual_lstm.json',
  },
  combined: {
    staticModel:     '/model/model.json',
    staticLabelMap:  '/model/label_map.json',
    dynamicModel:    '/model_dual_lstm/model.json',
    dynamicLabelMap: '/model_dual_lstm/label_map_dual_lstm.json',
  },
};

// TF model types — resolved lazily at runtime, not imported at module load.
type AnyModel = TF.LayersModel | TF.GraphModel;

interface ModelState {
  cnnModel:             AnyModel | null;
  cnnLabelMap:          Record<string, LabelEntry | string> | null;
  lstmModel:            tf.LayersModel | null;
  lstmLabelMap:         Record<string, LabelEntry | string> | null;
  dynamicInputFeatures: number;
  dynamicInputTimeSteps: number | null;
}

export function useGestureModel(
  lang: string = 'en',
  modelConfig: ModelConfig = 'static',
  videoRef?: React.RefObject<HTMLVideoElement>,
) {
  const [prediction, setPrediction]             = useState<GesturePrediction | null>(null);
  const [modelLoaded, setModelLoaded]           = useState(false);
  const [isModelSwitching, setIsModelSwitching] = useState(false);
  const [tcnBufferReady, setTcnBufferReady]     = useState(false);
  const [isHandPresent, setIsHandPresent]       = useState(false);
  const workerRef      = useRef<Worker | undefined>(undefined);
  const lastCallTime   = useRef<number>(0);
  const modelConfigRef = useRef<ModelConfig>(modelConfig);
  // Holds the lazily-loaded TF module so the worker message handler can use it
  const tfRef          = useRef<typeof import('@tensorflow/tfjs') | null>(null);
  const modelStateRef  = useRef<ModelState>({
    cnnModel: null, cnnLabelMap: null,
    lstmModel: null, lstmLabelMap: null,
    dynamicInputFeatures: 63,
    dynamicInputTimeSteps: null,
  });

  // Keep track of the current mode
  useEffect(() => { modelConfigRef.current = modelConfig; }, [modelConfig]);

  // Load the selected models from the public folder
  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();
    setModelSwitching_and_clear();

    const paths = MODEL_PATHS[modelConfig];

    const loadModels = async () => {
      try {
        // ── Dynamic import: TensorFlow.js is 3.2 MB — we fetch it lazily ────────────
        // This means TF only downloads AFTER the loading screen is visible,
        // so it never blocks the First Contentful Paint.
        const tf = await import('@tensorflow/tfjs');
        tfRef.current = tf; // Share the module with the worker message handler

        let staticModel: AnyModel | null = null;
        let staticLabelMap: Record<string, LabelEntry | string> | null = null;

        // Load the static classifier if it's in the config.
        // For RGB (MobileNetV2) the export may be in graph-model format because
        // the converter handles functional architectures better that way.
        // Try layers model first; fall back to graph model silently.
        if (paths.staticModel && paths.staticLabelMap) {
          try {
            staticModel = await tf.loadLayersModel(paths.staticModel);
          } catch {
            staticModel = await tf.loadGraphModel(paths.staticModel);
          }
          if (cancelled) { staticModel.dispose(); return; }
          const res = await fetch(paths.staticLabelMap, { signal: ctrl.signal });
          staticLabelMap = await res.json();
        }

        let dynamicModel: TF.LayersModel | null = null;
        let dynamicLabelMap: Record<string, LabelEntry | string> | null = null;
        let dynamicInputFeatures = 63;
        let dynamicInputTimeSteps: number | null = null;

        // Load the sequence classifier if it's in the config
        if (paths.dynamicModel && paths.dynamicLabelMap) {
          try {
            dynamicModel = await tf.loadLayersModel(paths.dynamicModel);
            if (cancelled) { dynamicModel.dispose(); staticModel?.dispose(); return; }
            const res = await fetch(paths.dynamicLabelMap, { signal: ctrl.signal });
            dynamicLabelMap = await res.json();
            
            // Check the model's expected input shape
            const inputShape = dynamicModel.inputs[0].shape;
            dynamicInputFeatures   = typeof inputShape[2] === 'number' ? inputShape[2] : 63;
            dynamicInputTimeSteps  = typeof inputShape[1] === 'number' ? inputShape[1] : null;
          } catch (err) {
            console.warn(`Model info: Mode "${modelConfig}" is missing some files.`, err);
          }
        }

        if (cancelled) {
          staticModel?.dispose();
          dynamicModel?.dispose();
          return;
        }

        // Free up memory from old models before saving new ones
        modelStateRef.current.cnnModel?.dispose();
        modelStateRef.current.lstmModel?.dispose();

        modelStateRef.current = {
          cnnModel:             staticModel,
          cnnLabelMap:          staticLabelMap,
          lstmModel:            dynamicModel,
          lstmLabelMap:         dynamicLabelMap,
          dynamicInputFeatures,
          dynamicInputTimeSteps,
        };

        setModelLoaded(true);
        setIsModelSwitching(false);
        console.log(`Model info: "${modelConfig}" ready.`);
      } catch (err) {
        console.error(`Error loading mode "${modelConfig}":`, err);
        setIsModelSwitching(false);
      }
    };

    loadModels();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [modelConfig]);

  function setModelSwitching_and_clear() {
    setIsModelSwitching(true);
    setModelLoaded(false);
    setPrediction(null);
    setTcnBufferReady(false);
  }

  // Set the confidence needed to trigger a detection (higher means more strict)
  const STATIC_THRESHOLD  = 0.65;
  const DYNAMIC_THRESHOLD = 0.72;
  const RGB_THRESHOLD     = 0.75;

  // Overrides for specific letters that often get confused
  const STATIC_CLASS_THRESHOLD: Record<number, number> = {
    29: 0.87,  // yod
    30: 0.87,  // alef maqsura
  };

  const debugCountRef = useRef(0);

  // Settings for making static predictions more steady
  const STATIC_STREAK_WINDOW = 4;
  const STATIC_STREAK_NEEDED = 3;
  const staticHistoryRef = useRef<string[]>([]);

  // Set up the background worker for processing frames
  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/preprocessWorker.ts', import.meta.url),
      { type: 'module' },
    );

    workerRef.current.onmessage = async (e) => {
      const { hands, lstmSequence } = e.data;

      // Reset predictions if no hand is visible
      if (!hands || hands.length === 0) {
        setIsHandPresent(false);
        staticHistoryRef.current = [];
        if (Date.now() - lastCallTime.current > 2000) {
          setPrediction(null);
          setTcnBufferReady(false);
        }
        return;
      }

      setIsHandPresent(true);

      // Limit how often we run the actual model
      const now = Date.now();
      if (now - lastCallTime.current < 150) return;
      lastCallTime.current = now;

      const { cnnModel, cnnLabelMap, lstmModel, lstmLabelMap, dynamicInputFeatures, dynamicInputTimeSteps }
        = modelStateRef.current;

      // Handle sequence/word prediction
      let lstmPrediction: GesturePrediction | null = null;
      if (lstmSequence && lstmModel && lstmLabelMap) {
        try {
          const padFrame = (frame: number[]) => {
            if (frame.length >= dynamicInputFeatures) return frame.slice(0, dynamicInputFeatures);
            return [...frame, ...Array(dynamicInputFeatures - frame.length).fill(0)];
          };

          let normSeq   = lstmSequence.normalized.map(padFrame);
          let mirrorSeq = lstmSequence.mirrored.map(padFrame);

          if (dynamicInputTimeSteps !== null) {
            const fixLen = (seq: number[][]) => {
              while (seq.length < dynamicInputTimeSteps)
                seq.unshift(seq[0] || Array(dynamicInputFeatures).fill(0));
              return seq.slice(-dynamicInputTimeSteps);
            };
            normSeq   = fixLen(normSeq);
            mirrorSeq = fixLen(mirrorSeq);
          }

          const T = normSeq.length;
          const tf = tfRef.current!;
          const inputTensor  = tf.tensor3d([normSeq, mirrorSeq], [2, T, dynamicInputFeatures]);
          const outputTensor = lstmModel.predict(inputTensor) as TF.Tensor;
          await tf.nextFrame();
          const probs = await outputTensor.data();
          inputTensor.dispose();
          outputTensor.dispose();

          const numClasses = probs.length / 2;
          let maxProb = 0, bestIdx = 0;
          for (let i = 0; i < probs.length; i++) {
            if (probs[i] > maxProb) { maxProb = probs[i]; bestIdx = i % numClasses; }
          }

          const rawEntry = lstmLabelMap[String(bestIdx)];
          const label = typeof rawEntry === 'object'
            ? (lang === 'ar' && (rawEntry as LabelEntry).arabic
                ? (rawEntry as LabelEntry).arabic
                : (rawEntry as LabelEntry).name)
            : rawEntry as string;

          if (++debugCountRef.current % 10 === 0)
            console.debug(`[Word Prediction] "${label}" ${(maxProb * 100).toFixed(1)}%`);

          if (maxProb >= DYNAMIC_THRESHOLD && label)
            lstmPrediction = { type: 'word', label, confidence: maxProb };
        } catch (err) {
          console.error('Word detection error:', err);
        }
      }

      // Handle single-frame/letter prediction
      let cnnPrediction: GesturePrediction | null = null;
      if (cnnModel && cnnLabelMap) {
        try {
          const typedHands = hands as Array<{ normalized: number[]; mirrored: number[]; isRight: boolean }>;
          const normRows   = typedHands.map(h => h.normalized).filter(r => r.length === 63);
          const mirrorRows = typedHands.map(h => h.mirrored).filter(r => r.length === 63);

          if (normRows.length > 0 || mirrorRows.length > 0) {
            // Predict on both normal and mirrored landmarks at once
            const allRows    = [...normRows, ...mirrorRows];
            const tf2 = tfRef.current!;
            const inputTensor  = tf2.tensor2d(allRows);
            const outputTensor = cnnModel.predict(inputTensor) as TF.Tensor;
            await tf2.nextFrame();
            const probs = await outputTensor.data();
            inputTensor.dispose();
            outputTensor.dispose();

            const numClasses = probs.length / allRows.length;

            const bestInSlice = (startRow: number, rowCount: number) => {
              let maxP = 0, idx = 0;
              for (let r = 0; r < rowCount; r++) {
                for (let c = 0; c < numClasses; c++) {
                  const p = probs[(startRow + r) * numClasses + c];
                  if (p > maxP) { maxP = p; idx = c; }
                }
              }
              return { maxP, idx };
            };

            const norm   = bestInSlice(0,             normRows.length);
            const mirror = bestInSlice(normRows.length, mirrorRows.length);

            // Choose the best prediction, preferring the normal orientation
            const tryOrientation = (maxP: number, idx: number) => {
              const thr = STATIC_CLASS_THRESHOLD[idx] ?? STATIC_THRESHOLD;
              return maxP >= thr ? { maxP, idx, thr } : null;
            };

            const normResult   = tryOrientation(norm.maxP,   norm.idx);
            const mirrorResult = tryOrientation(mirror.maxP, mirror.idx);
            const chosen       = normResult ?? mirrorResult;

            const maxP    = chosen?.maxP    ?? 0;
            const bestIdx = chosen?.idx     ?? norm.idx;
            const effectiveThreshold = chosen?.thr ?? (STATIC_CLASS_THRESHOLD[norm.idx] ?? STATIC_THRESHOLD);

            const rawEntry = cnnLabelMap[String(bestIdx)];
            const label = typeof rawEntry === 'object'
              ? `${(rawEntry as LabelEntry).arabic} (${(rawEntry as LabelEntry).name})`
              : rawEntry as string;

            if (++debugCountRef.current % 8 === 0)
              console.debug(`[Letter Prediction] "${label}" result=${(maxP*100).toFixed(1)}%`);

            // Check if the prediction has been consistent for a few frames
            const hist = staticHistoryRef.current;
            if (chosen && label) {
              hist.push(label);
              if (hist.length > STATIC_STREAK_WINDOW) hist.shift();
              const votes = hist.filter(l => l === label).length;
              if (votes >= STATIC_STREAK_NEEDED)
                cnnPrediction = { type: 'letter', label, confidence: maxP };
            } else {
              hist.push('');
              if (hist.length > STATIC_STREAK_WINDOW) hist.shift();
            }
          }
        } catch (err) {
          console.error('Letter detection error:', err);
        }
      }

      setPrediction(lstmPrediction ?? cnnPrediction ?? null);
    };

    return () => { workerRef.current?.terminate(); };
  }, []);

  // Hand presence flag is updated by the worker. No extra interval needed.


  // Send the landmark data from MediaPipe to the worker
  const processResults = useCallback((res: any) => {
    if (res?.multiHandLandmarks && modelLoaded) {
      workerRef.current?.postMessage({
        multiHandLandmarks: res.multiHandLandmarks,
        multiHandedness: res.multiHandedness,
        leftHandLandmarks: res.leftHandLandmarks,
        rightHandLandmarks: res.rightHandLandmarks,
        poseLandmarks: res.poseLandmarks,
      });
    }
  }, [modelLoaded]);

  return { prediction, isReady: modelLoaded, isModelSwitching, tcnBufferReady, isHandPresent, processResults };
}

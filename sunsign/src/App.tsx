import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Settings, GitBranch } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import CustomCursor from './components/CustomCursor';
import SolarBackground from './components/SolarBackground';
import LoadingEclipse from './components/LoadingEclipse';
import SunSignLogo from './components/SunSignLogo';
import SettingsPanel from './components/SettingsPanel';
import CameraView from './components/CameraView';
import LandmarkOverlay, { drawLandmarks } from './components/LandmarkOverlay';
import ConfidenceArc from './components/ConfidenceArc';
import SignInputRecorder from './components/SignInputRecorder';
import SignAnimator from './components/SignAnimator';

import type { Results } from '@mediapipe/hands';
import { useSignDetection } from './hooks/useSignDetection';
import { useGestureModel, type ModelConfig } from './hooks/useGestureModel';
import { useFingerSpelling } from './hooks/useFingerSpelling';
import { useTTS } from './hooks/useTTS';

/**
 * App
 * ===
 * This is the heart of the SunSign application. 
 * It brings together the camera, the AI models, and the 3D avatar.
 */

export default function App() {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Decide which model to use (Static letters, TCN movement, or RGB video)
  const [modelConfig, setModelConfig] = useState<ModelConfig>(() => {
    const stored = localStorage.getItem('sunsign_model_config') as ModelConfig;
    const valid: ModelConfig[] = ['static', 'tcn', 'rgb'];
    if (valid.includes(stored)) return stored;
    // Fallback for old versions
    if (stored === 'pointnet' || stored === 'standard') return 'static';
    if (stored === 'pointnet_tcn') return 'tcn';
    return 'static';
  });

  const { t, i18n } = useTranslation();

  const handleModelConfigChange = useCallback((config: ModelConfig) => {
    setModelConfig(config);
    localStorage.setItem('sunsign_model_config', config);
  }, []);

  const handleLoadingComplete = useCallback(() => setLoadingComplete(true), []);

  // Safety timer: If the intro loading screen gets stuck, force the app to open
  useEffect(() => {
    if (loadingComplete) return;
    const id = setTimeout(() => {
      console.warn('SunSign: Loading took too long—proceeding anyway!');
      setLoadingComplete(true);
    }, 8000);
    return () => clearTimeout(id);
  }, [loadingComplete]);

  // -- Setting up the Camera and the AI --
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { 
    prediction, 
    isReady: isGestureModelReady, 
    isModelSwitching, 
    tcnBufferReady, 
    isHandPresent, 
    processResults 
  } = useGestureModel(i18n.language, modelConfig, videoRef);

  /**
   * handleResults
   * =============
   * Every time the camera finds a hand, this function runs.
   * Logic: It checks for "ghost hands" (MediaPipe glitching) and 
   * only keeps the most solid one.
   */
  const handleResults = useCallback((res: Results) => {
    const WRIST_THRESHOLD = 0.15;
    const rawLM  = (res.multiHandLandmarks  ?? []) as any[][];
    const rawHed = (res.multiHandedness     ?? []) as any[];
    const kept: number[] = [];

    for (let i = 0; i < rawLM.length; i++) {
      const wi = rawLM[i][0];
      const isDup = kept.some(j => {
        const wj = rawLM[j][0];
        const dx = wi.x - wj.x, dy = wi.y - wj.y;
        return Math.sqrt(dx * dx + dy * dy) < WRIST_THRESHOLD;
      });
      if (!isDup) kept.push(i);
    }

    const dedupedRes = kept.length === rawLM.length
      ? res
      : { ...res,
          multiHandLandmarks: kept.map(i => rawLM[i]),
          multiHandedness:    kept.map(i => rawHed[i]) };

    // Send the clean hand data to the model and draw the dots on the screen
    processResults(dedupedRes as Results);
    drawLandmarks(canvasRef.current, dedupedRes);
  }, [processResults]);

  // Starts the camera and detection loop
  const { isActive: isCamActive, isModelReady } = useSignDetection(videoRef, handleResults, loadingComplete);

  // Tools for spelling words and making the computer talk
  const fingerSpelling = useFingerSpelling(prediction, isHandPresent);
  const { speak } = useTTS();

  return (
    <>
      <CustomCursor />

      {/* Show the cool black/yellow loading screen first */}
      {!loadingComplete && (
        <LoadingEclipse progress={isModelReady ? 100 : 30} onComplete={handleLoadingComplete} />
      )}

      {loadingComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative w-full h-[100dvh] overflow-hidden flex flex-col font-ui"
        >
          {/* Animated space-themed background */}
          <SolarBackground />

          {/* Hidden settings sidebar */}
          <SettingsPanel
            isOpen={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            lang={i18n.language}
            toggleLang={() => i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en')}
            modelConfig={modelConfig}
            onModelConfigChange={handleModelConfigChange}
            isModelSwitching={isModelSwitching}
          />

          {/* Top Header */}
          <header className="w-full px-8 py-5 flex items-center justify-between z-50 flex-shrink-0">
            <div className="flex items-center gap-4">
              <SunSignLogo size={44} />
              <div className="flex flex-col">
                <span className="font-brand text-3xl font-semibold tracking-wide text-text-primary uppercase">
                  SunSign
                </span>
                <span className="font-arabic text-sm text-text-secondary opacity-80" dir="rtl">
                  {t('app_tagline')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en')}
                className="font-brand text-lg text-text-secondary hover:text-sun-warm transition-colors w-12"
              >
                {i18n.language === 'en' ? 'AR' : 'EN'}
              </button>
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-3 sun-glass hover:bg-sun-core/10 transition-colors text-text-primary rounded-full group"
              >
                <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
              </button>
            </div>
          </header>

          {/* Main Workspace */}
          <main className="flex-1 min-h-0 w-full px-8 pb-8 z-10 flex flex-col xl:flex-row gap-8">

            {/* Left Side: Camera and Input */}
            <div className="flex flex-col gap-6 w-full xl:w-1/2 min-h-0">
              <div className="relative rounded-3xl overflow-hidden sun-glass border border-sun-border
                              shadow-[0_0_60px_rgba(255,238,2,0.08)] w-full flex-shrink-0 aspect-video">
                <CameraView
                  videoRef={videoRef}
                  isActive={isCamActive}
                  className="w-full h-full object-cover"
                />
                {/* The yellow dots/bones shown over your hand */}
                <LandmarkOverlay
                  canvasRef={canvasRef}
                  className="w-full h-full object-cover"
                  isDetectingSign={prediction !== null && prediction.confidence > 0.70}
                />
                
                {/* Small indicator when the model is still warming up */}
                {modelConfig === 'tcn' && isGestureModelReady && !tcnBufferReady && (
                  <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5
                                  bg-sun-void/70 backdrop-blur-sm rounded-full px-3 py-1
                                  border border-sun-core/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-sun-core animate-pulse" />
                    <span className="font-ui text-[10px] uppercase tracking-widest text-sun-core/80">
                      Hold sign to buffer…
                    </span>
                  </div>
                )}

                {/* Score badge: how sure is the AI about this sign? */}
                <div className="absolute bottom-4 right-4 z-30">
                  <ConfidenceArc
                    confidence={prediction ? prediction.confidence : 0}
                    label={prediction ? prediction.label : ''}
                  />
                </div>
              </div>

              {/* The text recorder and control buttons */}
              <div className="flex-none pt-2">
                <SignInputRecorder 
                  currentLetter={fingerSpelling.currentLetter}
                  holdProgress={fingerSpelling.holdProgress}
                  currentWord={fingerSpelling.currentWord}
                  sentence={fingerSpelling.sentence}
                  onBackspace={fingerSpelling.backspace}
                  onClear={fingerSpelling.clearAll}
                  onSpeak={speak}
                  onSentenceChange={fingerSpelling.setSentenceDirectly}
                />
              </div>
            </div>

            {/* Right Side: The 3D Avatar */}
            <div className="flex-1 min-h-0 flex flex-col w-full xl:w-1/2 rounded-3xl overflow-hidden border border-sun-border shadow-[0_0_40px_rgba(0,0,0,0.5)]">
              <SignAnimator />
            </div>

          </main>

          {/* Simple Footer */}
          <footer className="w-full py-3 text-center z-50 flex-shrink-0">
            <p className="font-ui text-[0.6rem] text-text-secondary/50 flex items-center justify-center gap-2 uppercase tracking-widest">
              SunSign — {t('footer_os')}
              <GitBranch size={12} className="ml-1 hover:text-sun-warm cursor-pointer" />
            </p>
          </footer>
        </motion.div>
      )}
    </>
  );
}

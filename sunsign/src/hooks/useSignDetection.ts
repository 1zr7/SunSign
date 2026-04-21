import { useEffect, useState, useRef } from 'react';
import type { Results } from '@mediapipe/holistic';

/**
 * useSignDetection
 * ================
 * This hook starts the camera and the "Holistic Finder" tool (MediaPipe).
 * It runs in a loop, synchronously finding Pose, Face, and Both Hands.
 */

export function useSignDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  onResults: (res: Results) => void,
  trigger?: any
) {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModelReady, setIsModelReady] = useState(false);

  const holisticRef = useRef<any>(null);
  const onResultsRef = useRef(onResults);

  // Keep our callback up-to-date
  useEffect(() => {
    onResultsRef.current = onResults;
  }, [onResults]);

  // -- Step 1: Open the Hand Finder (MediaPipe) --
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let initTimeout: number;

    const initMediaPipe = async () => {
      const { Holistic } = window as any;
      
      // Wait for the script to load from the internet
      if (!Holistic) {
         initTimeout = window.setTimeout(initMediaPipe, 500);
         return;
      }

      if (!holisticRef.current) {
        holisticRef.current = new Holistic({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`
        });

        // Setup holistic settings
        holisticRef.current.setOptions({
          modelComplexity: 1, // 1 is a good balance for accuracy vs speed
          smoothLandmarks: true,
          enableSegmentation: false,
          refineFaceLandmarks: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        // What happens when it finds a hand/pose?
        holisticRef.current.onResults((res: Results) => {
          if (onResultsRef.current) {
            onResultsRef.current(res);
          }
        });
        
        setIsModelReady(true);
      }
    };

    initMediaPipe();

    return () => {
      clearTimeout(initTimeout);
      if (holisticRef.current) holisticRef.current.close();
    };
  }, []);

  // -- Step 2: Open the Camera and start the Processing Loop --
  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrameId: number;
    let cancelled = false;

    const startSystem = async () => {
      if (!videoRef.current) return;

      // Let's find your camera!
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        let deviceId = undefined;
        
        // Try to ignore virtual cameras (like OBS) so we get the real one
        const realCamera = videoDevices.find(d => !d.label.toLowerCase().includes('obs') && !d.label.toLowerCase().includes('virtual'));
        if (realCamera) {
            deviceId = { ideal: realCamera.deviceId };
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 24, max: 30 },
            facingMode: 'user',
            ...(deviceId ? { deviceId } : {}),
          },
        });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsActive(true);
        setError(null);
      } catch (err: any) {
        console.error("Camera error:", err);
        setError("Could not open the camera. Please check your permissions.");
        setIsActive(false);
        return;
      }

      let isProcessing = false;
      let lastVideoTime = -1;
      let lastProcessTime = 0;
      // Holistic is heavy — cap at ~20fps to prevent main-thread stalls
      const PROCESS_INTERVAL_MS = 50;

      const processFrame = async () => {
        if (cancelled) return;

        const now = performance.now();
        const video = videoRef.current;

        if (
          video &&
          video.readyState >= 2 &&
          holisticRef.current &&
          isModelReady &&
          !isProcessing &&
          now - lastProcessTime >= PROCESS_INTERVAL_MS &&
          video.currentTime !== lastVideoTime
        ) {
          lastVideoTime = video.currentTime;
          lastProcessTime = now;
          isProcessing = true;
          try {
            await holisticRef.current.send({ image: video });
          } catch (err) {
            console.error("Discovery error:", err);
          } finally {
            isProcessing = false;
          }
        }

        animationFrameId = requestAnimationFrame(processFrame);
      };

      // Start the loop once everything is ready
      if (isModelReady) {
         processFrame();
      } else {
         const checkReady = setInterval(() => {
            if (holisticRef.current && isModelReady) {
                clearInterval(checkReady);
                processFrame();
            }
         }, 500);
      }
    };

    startSystem();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setIsActive(false);
    };
  }, [videoRef, trigger, isModelReady]); 

  return { isActive, error, isModelReady };
}

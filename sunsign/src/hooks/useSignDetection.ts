import { useEffect, useState, useRef } from 'react';
import type { Results } from '@mediapipe/hands';

/**
 * useSignDetection
 * ================
 * This hook starts the camera and the "Hand Finder" tool (MediaPipe).
 * It runs in a loop, taking pictures from the camera and finding where 
 * the hands are.
 */

export function useSignDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  onResults: (res: Results) => void,
  trigger?: any
) {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModelReady, setIsModelReady] = useState(false);

  const handsRef = useRef<any>(null);
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
      const { Hands } = window as any;
      
      // Wait for the script to load from the internet
      if (!Hands) {
         initTimeout = window.setTimeout(initMediaPipe, 500);
         return;
      }

      if (!handsRef.current) {
        handsRef.current = new Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        // Setup the hand settings
        handsRef.current.setOptions({
          maxNumHands: 2,
          modelComplexity: 0, // 0 is fastest (good for web)
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        // What happens when it finds a hand?
        handsRef.current.onResults((res: Results) => {
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
      if (handsRef.current) handsRef.current.close();
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
            width: { ideal: 1280 },
            height: { ideal: 720 },
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

      // This function runs as fast as possible to find hands in the video
      const processFrame = async () => {
        if (cancelled) return;
        
        const video = videoRef.current;
        if (video && video.readyState >= 2 && handsRef.current && isModelReady && !isProcessing) {
          // Only process if the video has moved to a new frame
          if (video.currentTime !== lastVideoTime) {
            lastVideoTime = video.currentTime;
            isProcessing = true;
            try {
              // Send the picture to the hand finder
              await handsRef.current.send({ image: video });
            } catch (err) {
              console.error("Discovery error:", err);
            } finally {
              isProcessing = false;
            }
          }
        }
        
        // Keep the loop going
        animationFrameId = requestAnimationFrame(processFrame);
      };

      // Start the loop once everything is ready
      if (isModelReady) {
         processFrame();
      } else {
         const checkReady = setInterval(() => {
            if (handsRef.current && isModelReady) {
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

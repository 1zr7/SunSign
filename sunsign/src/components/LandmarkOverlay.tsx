import { useEffect, useRef } from 'react';
import type { Results } from '@mediapipe/hands';

/**
 * drawLandmarks
 * =============
 * This function is the "artist." It takes the list of hand points from the AI 
 * and draws them as yellow dots and lines on the screen using a Canvas.
 */
export function drawLandmarks(canvas: HTMLCanvasElement | null, results: any) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Make sure the canvas size matches the screen size
  const { offsetWidth, offsetHeight } = canvas;
  if (canvas.width !== offsetWidth || canvas.height !== offsetHeight) {
    canvas.width  = offsetWidth;
    canvas.height = offsetHeight;
  }
  
  // Clear the previous frame so we can draw the new one
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const landmarks = results?.multiHandLandmarks;
  if (!landmarks || landmarks.length === 0) return;

  const { drawConnectors, HAND_CONNECTIONS } = window as any;

  for (const hand of landmarks) {
    // 1. Draw the "bones" (lines connecting the finger points)
    if (drawConnectors && HAND_CONNECTIONS) {
      ctx.save();
      drawConnectors(ctx, hand, HAND_CONNECTIONS, { color: '#FFB800', lineWidth: 2 });
      ctx.restore();
    }
    
    // 2. Draw the "joints" (the little yellow circles)
    for (const lm of hand) {
      // Landmarks are 0 to 1, so we multiply by width/height to get pixels
      const x = lm.x * canvas.width;
      const y = lm.y * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFB800';
      ctx.fill();
    }
  }
}

/**
 * LandmarkOverlay
 * ===============
 * This is just the transparent "paper" that sits on top of the camera. 
 * We use it to draw the hand bones.
 */
interface LandmarkOverlayProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  className?: string;
  isDetectingSign?: boolean;
}

export default function LandmarkOverlay({
  canvasRef,
  className = '',
  isDetectingSign,
}: LandmarkOverlayProps) {
  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none w-full h-full z-20 ${isDetectingSign ? 'active-detect-pulse' : ''} ${className}`}
      // Just like the camera, flip the drawing so it matches our mirror image
      style={{ transform: 'scaleX(-1)' }}
    />
  );
}

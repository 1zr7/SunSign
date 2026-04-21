/**
 * LandmarkOverlay
 * ===============
 * Draws hand and pose landmarks on the canvas.
 * Coordinates are manually flipped in JS to match the mirrored video,
 * so the canvas element itself does NOT need a CSS transform.
 */

export function drawLandmarks(canvas: HTMLCanvasElement | null, videoElement: HTMLVideoElement | null, results: any) {
  if (!canvas || !videoElement) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = videoElement.videoWidth;
  const H = videoElement.videoHeight;

  if (W === 0 || H === 0) return;

  // Sync canvas pixel dimensions to the un-cropped video actual dimensions.
  // The browser CSS engine will appropriately stretch and crop (object-cover) the canvas 
  // identically to the video, which fixes the offset WITHOUT doing expensive layout measurements (offsetWidth).
  if (canvas.width !== W || canvas.height !== H) {
    canvas.width  = W;
    canvas.height = H;
  }

  ctx.clearRect(0, 0, W, H);

  // Flip X to mirror onto the mirrored video. Y stays the same.
  const fx = (x: number) => (1 - x) * W;
  const fy = (y: number) => y * H;

  // -- Pose skeleton (upper body only, subtle grey) --
  const poseLM = results?.poseLandmarks;
  if (poseLM && poseLM.length >= 25) {
    const UPPER_CONNECTIONS: [number, number][] = [
      [11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],
    ];
    const UPPER_JOINTS = [11, 12, 13, 14, 15, 16];

    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = '#888888';
    ctx.lineWidth   = 1.5;
    for (const [a, b] of UPPER_CONNECTIONS) {
      if (!poseLM[a] || !poseLM[b]) continue;
      ctx.beginPath();
      ctx.moveTo(fx(poseLM[a].x), fy(poseLM[a].y));
      ctx.lineTo(fx(poseLM[b].x), fy(poseLM[b].y));
      ctx.stroke();
    }
    ctx.fillStyle = '#888888';
    for (const idx of UPPER_JOINTS) {
      if (!poseLM[idx]) continue;
      ctx.beginPath();
      ctx.arc(fx(poseLM[idx].x), fy(poseLM[idx].y), 3, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }

  // -- Hand skeletons (yellow) --
  const HAND_CONNECTIONS: [number, number][] = [
    [0,1],[1,2],[2,3],[3,4],
    [0,5],[5,6],[6,7],[7,8],
    [5,9],[9,10],[10,11],[11,12],
    [9,13],[13,14],[14,15],[15,16],
    [13,17],[17,18],[18,19],[19,20],[0,17],
  ];

  const landmarks = results?.multiHandLandmarks;
  if (!landmarks || landmarks.length === 0) return;

  for (const hand of landmarks) {
    ctx.strokeStyle = '#FFB800';
    ctx.lineWidth   = 2;
    for (const [a, b] of HAND_CONNECTIONS) {
      if (!hand[a] || !hand[b]) continue;
      ctx.beginPath();
      ctx.moveTo(fx(hand[a].x), fy(hand[a].y));
      ctx.lineTo(fx(hand[b].x), fy(hand[b].y));
      ctx.stroke();
    }
    ctx.fillStyle = '#FFB800';
    for (const lm of hand) {
      ctx.beginPath();
      ctx.arc(fx(lm.x), fy(lm.y), 4, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}


/**
 * LandmarkOverlay Component
 * =========================
 * Transparent canvas sitting above the camera.
 * No CSS scaleX(-1) — flipping is handled inside drawLandmarks.
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
    />
  );
}

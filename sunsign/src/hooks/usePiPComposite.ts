import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * usePiPComposite
 * ===============
 * This hook creates a Picture-in-Picture window that shows both the 
 * camera (left) and the 3D Avatar (right). Since PiP only supports 
 * a single <video> element, we draw both the camera and the WebGL 
 * canvas onto a hidden 2D canvas, and then stream that to the PiP window.
 */
export function usePiPComposite(videoRef: React.RefObject<HTMLVideoElement | null>, captionText: string = '') {
  const [isPiPActive, setIsPiPActive] = useState(false);
  const compositeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pipVideoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const captionRef = useRef(captionText);
  // Update ref synchronously during render to guarantee the drawing loop sees the absolute latest string
  captionRef.current = captionText;

  // Setup the hidden elements once
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      // 16:9 ratio, split down the middle (640x720 each side)
      canvas.width = 1280;
      canvas.height = 720;
      compositeCanvasRef.current = canvas;

      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      // We don't append the video to the DOM, it just lives in memory
      pipVideoRef.current = video;

      // Handle when the user closes the PiP window natively (via the 'x' button)
      video.addEventListener('leavepictureinpicture', () => {
        setIsPiPActive(false);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      });
    }
  }, []);

  const startDrawingLoop = useCallback(() => {
    if (!compositeCanvasRef.current) return;
    const ctx = compositeCanvasRef.current.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      // 1. Draw the Camera on the left (0 to 640)
      if (videoRef.current && videoRef.current.readyState >= 2) {
        // We draw the camera flipped horizontally so it feels like a mirror
        ctx.save();
        ctx.translate(640, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, 640, 720);
        ctx.restore();
      } else {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 640, 720);
      }

      // 2. Draw the Avatar on the right (640 to 1280)
      const avatarContainer = document.getElementById('avatar-canvas');
      const avatarCanvas = avatarContainer?.querySelector('canvas');
      if (avatarCanvas) {
        ctx.drawImage(avatarCanvas, 640, 0, 640, 720);
      } else {
        ctx.fillStyle = '#111111';
        ctx.fillRect(640, 0, 640, 720);
      }

      // 3. Draw Captions at the bottom
      // Semi-transparent black background bar
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 620, 1280, 100);

      // Yellow text
      ctx.fillStyle = '#FFEE02';
      ctx.font = 'bold 36px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const currentCaption = captionRef.current;
      if (currentCaption && currentCaption.trim() !== '') {
        ctx.fillText(currentCaption, 640, 670, 1200);
      } else {
        ctx.fillStyle = '#FFEE02';
        ctx.fillText("Listening...", 640, 670, 1200);
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  }, [videoRef]);

  const togglePiP = useCallback(async () => {
    try {
      if (isPiPActive && document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        return;
      }

      if (!compositeCanvasRef.current || !pipVideoRef.current) return;

      // Start the drawing loop
      startDrawingLoop();

      // Capture the stream from our composite canvas (30 fps)
      const stream = compositeCanvasRef.current.captureStream(30);
      pipVideoRef.current.srcObject = stream;
      
      await pipVideoRef.current.play();
      
      // Request Picture in Picture for our hidden composite video
      await pipVideoRef.current.requestPictureInPicture();
      setIsPiPActive(true);

    } catch (error) {
      console.error("Failed to enter Picture-in-Picture mode:", error);
      setIsPiPActive(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, [isPiPActive, startDrawingLoop]);

  return { isPiPActive, togglePiP };
}

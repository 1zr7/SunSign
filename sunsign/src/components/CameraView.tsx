import React from 'react';

/**
 * CameraView
 * ==========
 * This component shows the rectangle where you see yourself on the screen.
 * It connects to your webcam and mirrors the video so it feels natural.
 */

interface CameraViewProps {
  videoRef: React.Ref<HTMLVideoElement>;
  isActive: boolean;
  className?: string;
}

export default function CameraView({ videoRef, isActive, className = "" }: CameraViewProps) {
  return (
    <div className={`relative w-full h-full overflow-hidden bg-sun-void rounded-2xl sun-glass ${className}`}>
      {/* If the camera hasn't started yet, show some instructions */}
      {!isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-sun-warm opacity-80">
          <svg className="w-16 h-16 animate-pulse mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11" />
          </svg>
          <p className="font-brand text-xl">Show me your hands / أرني يديك</p>
        </div>
      )}

      {/* The actual video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{
          // Looking in a mirror: flip the video horizontally
          transform: 'scaleX(-1)', 
          // Make the colors look a bit sharper
          filter: 'brightness(1.05) contrast(1.05)', 
        }}
      />
    </div>
  );
}

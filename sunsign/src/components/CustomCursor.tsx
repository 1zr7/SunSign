import { useEffect, useRef } from 'react';

/**
 * CustomCursor
 * ============
 * This adds a cool, custom yellow circle that follows your mouse 
 * around the screen. It feels much smoother than the default 
 * browser cursor.
 */

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const mousePos = useRef({ x: 0, y: 0 });
  const cursorPos = useRef({ x: 0, y: 0 });
  const expand = useRef(false);

  useEffect(() => {
    // 1. Keep track of where the actual mouse is
    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    // 2. Check if the mouse is hovering over a button or a link
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a'
      ) {
        expand.current = true; // Grow the cursor
      } else {
        expand.current = false; // Shrink it back
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    // 3. This function makes the yellow circle "chase" the real mouse
    const animateCursor = () => {
      // The 0.15 here makes it "elastic" so it doesn't snap instantly
      cursorPos.current.x += (mousePos.current.x - cursorPos.current.x) * 0.15;
      cursorPos.current.y += (mousePos.current.y - cursorPos.current.y) * 0.15;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorPos.current.x}px, ${cursorPos.current.y}px, 0)`;
        
        // Change colors and size based on whether we are hovering over a button
        if (expand.current) {
          cursorRef.current.classList.add('w-8', 'h-8', 'bg-sun-core', '-ml-4', '-mt-4');
          cursorRef.current.classList.remove('w-4', 'h-4', 'bg-sun-ray', '-ml-2', '-mt-2');
          cursorRef.current.style.boxShadow = '0 0 20px rgba(255,184,0,0.6)';
        } else {
          cursorRef.current.classList.add('w-4', 'h-4', 'bg-sun-ray', '-ml-2', '-mt-2');
          cursorRef.current.classList.remove('w-8', 'h-8', 'bg-sun-core', '-ml-4', '-mt-4');
          cursorRef.current.style.boxShadow = '0 0 10px rgba(255,209,102,0.4)';
        }
      }
      requestRef.current = requestAnimationFrame(animateCursor);
    };

    // Start the chasing loop
    animateCursor();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 rounded-full pointer-events-none z-[10000] transition-all duration-150 ease-out"
      style={{
        boxShadow: '0 0 10px rgba(255,209,102,0.4)',
      }}
    />
  );
}

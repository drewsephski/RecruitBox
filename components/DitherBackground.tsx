import React, { useEffect, useRef } from 'react';

const DitherBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimization
    if (!ctx) return;

    let animationFrameId: number;
    let resizeTimeout: any;

    // Grid configuration
    const spacing = 24; // Space between dots
    const dotBaseSize = 1.5;
    
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
      mouseRef.current = { x: canvas.width / 2, y: canvas.height / 2 };
      targetRef.current = { x: canvas.width / 2, y: canvas.height / 2 };
    };

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resize, 100);
    });
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    window.addEventListener('mousemove', handleMouseMove);

    const draw = () => {
      // Smooth mouse interpolation
      mouseRef.current.x += (targetRef.current.x - mouseRef.current.x) * 0.1;
      mouseRef.current.y += (targetRef.current.y - mouseRef.current.y) * 0.1;

      // Clear with dark background
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cols = Math.ceil(canvas.width / spacing);
      const rows = Math.ceil(canvas.height / spacing);

      ctx.fillStyle = '#333'; // Default dim dot color

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = j * spacing;
          
          // Calculate distance from mouse
          const dx = x - mouseRef.current.x;
          const dy = y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Dither effect radius
          const maxDist = 600;
          
          // Probabilistic rendering for dither effect
          // The closer to the mouse, the higher the chance to draw a bright dot or larger dot
          if (dist < maxDist) {
            const intensity = 1 - (dist / maxDist);
            
            // Random threshold for "dither" noise look
            if (Math.random() < intensity * 1.5) {
                // Bright active dots
                const size = dotBaseSize + (intensity * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.8})`;
                ctx.beginPath();
                ctx.rect(x - size/2, y - size/2, size, size);
                ctx.fill();
                continue;
            }
          }

          // Background static grid (faint)
          if (i % 2 === 0 && j % 2 === 0) {
             ctx.fillStyle = 'rgba(40, 40, 40, 0.5)';
             ctx.fillRect(x, y, 1, 1);
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize); // Clean up resize listener
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0 w-full h-full pointer-events-none"
    />
  );
};

export default DitherBackground;
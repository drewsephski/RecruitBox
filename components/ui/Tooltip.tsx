import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top - 8, // 8px spacing
        left: rect.left + rect.width / 2
      });
    }
  };

  const handleMouseEnter = () => {
    updatePosition();
    setIsVisible(true);
  };

  // Keep position in sync if the user scrolls or resizes while tooltip is open
  useEffect(() => {
    if (isVisible) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible]);

  return (
    <>
      <div 
        ref={triggerRef}
        className={`relative flex items-center ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && createPortal(
        <div 
          className="fixed z-[9999] px-2.5 py-1.5 bg-[#1A1A1A] text-neutral-200 text-[10px] font-medium rounded border border-white/10 shadow-xl whitespace-nowrap pointer-events-none"
          style={{
            top: coords.top,
            left: coords.left,
            transform: 'translate(-50%, -100%)',
            animation: 'tooltip-appear 0.15s ease-out forwards'
          }}
        >
           <style>
            {`
              @keyframes tooltip-appear {
                0% { opacity: 0; transform: translate(-50%, -90%) scale(0.96); }
                100% { opacity: 1; transform: translate(-50%, -100%) scale(1); }
              }
            `}
          </style>
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-[#1A1A1A]"></div>
        </div>,
        document.body
      )}
    </>
  );
};
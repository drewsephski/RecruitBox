import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label?: string;
}

export const Select: React.FC<SelectProps> = ({ value, onChange, options, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find(opt => opt.value === value)?.label || value;

  return (
    <div className="relative" ref={containerRef}>
      {label && <label className="block text-[10px] font-mono text-neutral-500 mb-2 uppercase tracking-wider">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[#0A0A0A] border text-xs text-white rounded-md px-3 py-2.5 text-left focus:outline-none transition-all duration-200 flex justify-between items-center group ${
          isOpen 
            ? 'border-sky-500/50 shadow-[0_0_10px_rgba(14,165,233,0.1)] ring-1 ring-sky-500/20' 
            : 'border-white/10 hover:border-white/20'
        }`}
      >
        <span className="truncate font-medium">{selectedLabel}</span>
        <svg 
          className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-sky-500' : 'group-hover:text-neutral-400'}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div 
          className="absolute w-full mt-1 bg-[#0F0F0F] border border-white/10 rounded-md shadow-2xl z-50 overflow-hidden origin-top"
          style={{ animation: 'select-open 0.15s ease-out forwards' }}
        >
          <style>
            {`
              @keyframes select-open {
                0% { opacity: 0; transform: scaleY(0.96) translateY(-4px); }
                100% { opacity: 1; transform: scaleY(1) translateY(0); }
              }
            `}
          </style>
          <div className="p-1 max-h-60 overflow-auto custom-scrollbar">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs rounded-sm transition-colors flex items-center justify-between ${
                  value === option.value 
                    ? 'bg-white/10 text-white font-medium' 
                    : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
                }`}
              >
                {option.label}
                {value === option.value && (
                   <svg className="w-3 h-3 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                   </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
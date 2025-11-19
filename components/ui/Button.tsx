import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none rounded-md tracking-tight active:scale-[0.98]";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-4 text-base"
  };

  const variants = {
    primary: "bg-white text-black border border-transparent font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-neutral-100 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:-translate-y-[1px] active:translate-y-[0px] active:shadow-none",
    secondary: "bg-neutral-800 text-white border border-neutral-700 hover:bg-neutral-700 hover:border-neutral-600 hover:-translate-y-[1px] hover:shadow-lg active:translate-y-[0px]",
    outline: "bg-transparent text-white border border-neutral-700 hover:border-white hover:bg-white/[0.02] hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] active:bg-white/[0.05]",
    ghost: "bg-transparent text-neutral-400 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.12]"
  };

  return (
    <button 
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
        </span>
      ) : children}
    </button>
  );
};
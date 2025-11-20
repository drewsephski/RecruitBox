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
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none rounded-md tracking-tight active:scale-[0.98]";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-4 text-base"
  };

  const variants = {
    primary: "bg-white/90 text-slate-950 border border-white/40 font-semibold shadow-[0_2px_8px_rgba(15,23,42,0.08)] hover:bg-white hover:shadow-[0_4px_12px_rgba(15,23,42,0.1)] hover:border-white/60",
    secondary: "bg-slate-900/60 text-white border border-white/10 hover:bg-slate-900/80 hover:border-white/20",
    outline: "bg-transparent text-white border border-white/20 hover:border-white/40 hover:bg-white/5",
    ghost: "bg-transparent text-neutral-400 hover:text-white hover:bg-white/5"
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
      ) : children}
    </button>
  );
};
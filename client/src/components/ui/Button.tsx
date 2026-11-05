import React, { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-[8px] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 select-none';

  const variants = {
    primary:
      'bg-navy-800 text-cream-50 hover:bg-navy-700 active:bg-navy-900 focus-visible:ring-blue-600 shadow-sm shadow-navy-900/10',
    secondary:
      'bg-transparent text-navy-800 border-[1.5px] border-navy-800 hover:bg-navy-800 hover:text-cream-50 focus-visible:ring-blue-600',
    accent:
      'bg-crimson-600 text-white hover:bg-crimson-700 active:bg-crimson-800 focus-visible:ring-crimson-600 shadow-sm shadow-crimson-600/20',
    outline:
      'border border-sand-300 text-ink bg-cream-50 hover:bg-sand-200 hover:text-navy-800 focus-visible:ring-blue-600',
    ghost:
      'text-navy-800 hover:bg-sand-200/60 focus-visible:ring-blue-600',
    danger:
      'bg-crimson-700 text-white hover:bg-crimson-800 focus-visible:ring-crimson-600 shadow-sm shadow-crimson-700/20',
    link:
      'text-blue-600 hover:underline p-0 h-auto bg-transparent focus-visible:ring-blue-600',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 min-h-[36px] gap-1.5',
    md: 'text-sm px-4 py-2 min-h-[44px] gap-2',
    lg: 'text-base px-6 py-3 min-h-[48px] gap-2.5',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
};

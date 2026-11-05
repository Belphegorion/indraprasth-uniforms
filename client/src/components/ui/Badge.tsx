import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'slate' | 'outline' | 'info' | 'neutral' | 'navy';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'brand',
  ...props
}) => {
  const variants = {
    brand: 'bg-blue-100 text-navy-800 border-blue-600/30',
    accent: 'bg-crimson-600 text-white border-transparent shadow-xs',
    success: 'bg-[#DDF0E6] text-[#2F7D5B] border-[#2F7D5B]/30',
    warning: 'bg-[#FBEFD5] text-[#B7791F] border-[#B7791F]/30',
    danger: 'bg-crimson-100 text-crimson-700 border-crimson-600/30',
    slate: 'bg-sand-200 text-slate border-sand-300',
    outline: 'bg-transparent text-navy-800 border-sand-300',
    info: 'bg-blue-100 text-blue-600 border-blue-600/30',
    neutral: 'bg-sand-200 text-slate border-sand-300',
    navy: 'bg-navy-800 text-cream-50 border-navy-700',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-2 py-0.5 rounded-[4px] text-xs font-semibold tracking-wide border uppercase',
          variants[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
};

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'accent';
}

export const Badge: React.FC<BadgeProps> = ({ className, children, variant = 'neutral', ...props }) => {
  const variants = {
    success: 'bg-[rgba(61,214,140,0.1)] text-[#3DD68C] border border-[rgba(61,214,140,0.2)]',
    warning: 'bg-[rgba(240,168,50,0.1)] text-[#F0A832] border border-[rgba(240,168,50,0.2)]',
    danger: 'bg-[rgba(232,68,42,0.1)] text-[#E8442A] border border-[rgba(232,68,42,0.2)]',
    neutral: 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border-default)]',
    accent: 'bg-[rgba(232,100,42,0.1)] text-[var(--color-accent)] border border-[rgba(232,100,42,0.2)]',
  };

  return (
    <span
      className={cn(
        'px-2 py-0.5 text-[10px] uppercase font-bold tracking-[0.05em] rounded-[var(--radius-sm)]',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ className, children, padding = 'md', ...props }) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5 px-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] shadow-xl shadow-black/20',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};


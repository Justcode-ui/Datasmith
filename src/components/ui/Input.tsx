import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-[11px] font-medium tracking-[0.08em] text-[var(--color-text-secondary)] uppercase">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] transition-all focus:border-[var(--color-accent)] focus:ring-[3px] focus:ring-[rgba(232,100,42,0.15)] outline-none',
            error && 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/15',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-[var(--color-danger)] mt-1">{error}</span>}
      </div>
    );
  }
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-[11px] font-medium tracking-[0.08em] text-[var(--color-text-secondary)] uppercase">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] transition-all focus:border-[var(--color-accent)] focus:ring-[3px] focus:ring-[rgba(232,100,42,0.15)] outline-none min-h-[120px] resize-none',
            error && 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/15',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-[var(--color-danger)] mt-1">{error}</span>}
      </div>
    );
  }
);

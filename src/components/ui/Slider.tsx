import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}

export const Slider: React.FC<SliderProps> = ({ 
  className, label, value, min, max, step = 1, suffix = '', onChange, ...props 
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('flex flex-col gap-3 w-full', className)}>
      <div className="flex justify-between items-end">
        <label className="text-[11px] font-medium tracking-[0.08em] text-[var(--color-text-secondary)] uppercase">
          {label}
        </label>
        <span className="text-sm font-mono text-[var(--color-text-primary)]">
          {value}{suffix}
        </span>
      </div>
      <div className="relative h-6 flex items-center">
        <div className="absolute w-full h-1 bg-[var(--color-border-default)] rounded-full" />
        <div 
          className="absolute h-1 bg-[var(--color-accent)] rounded-full" 
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          className="absolute w-full h-1 opacity-0 cursor-pointer z-10"
          {...props}
        />
        <div 
          className="absolute w-4.5 h-4.5 bg-white border-2 border-[var(--color-accent)] rounded-full shadow-md pointer-events-none transition-transform active:scale-125"
          style={{ left: `calc(${percentage}% - 9px)` }}
        />
      </div>
    </div>
  );
};

interface SegmentedControlProps {
  label?: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({ 
  label, options, value, onChange, className 
}) => {
  return (
    <div className={cn('flex flex-col gap-2 w-full', className)}>
      {label && (
        <label className="text-[11px] font-medium tracking-[0.08em] text-[var(--color-text-secondary)] uppercase">
          {label}
        </label>
      )}
      <div className="flex bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] p-1 overflow-hidden">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 px-3 py-2 text-xs font-medium rounded-[calc(var(--radius-md)-4px)] transition-all',
              value === opt.value 
                ? 'bg-[var(--color-accent)] text-white shadow-sm' 
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { useDatasmithStore } from '../../store/datasmith';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const StepIndicator: React.FC = () => {
  const { step } = useDatasmithStore();

  const steps = [
    { number: 1, label: 'Forge' },
    { number: 2, label: 'Schema' },
    { number: 3, label: 'Casting' },
    { number: 4, label: 'Output' },
  ];

  return (
    <div className="flex items-center gap-3 md:gap-6">
      {steps.map((s, i) => (
        <React.Fragment key={s.number}>
          <div className="flex items-center gap-1.5 md:gap-2">
            <div
              className={cn(
                'w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-500',
                step === s.number ? 'bg-[var(--color-accent)] scale-125 md:scale-150 shadow-[0_0_8px_var(--color-accent)]' : 
                step > s.number ? 'bg-[var(--color-success)]' : 'bg-[var(--color-border-default)]'
              )}
            />
            <span
              className={cn(
                'text-[8px] md:text-[10px] font-medium tracking-[0.05em] md:tracking-widest uppercase transition-colors duration-500',
                step === s.number ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-disabled)]'
              )}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="w-2 md:w-4 h-[1px] bg-[var(--color-border-default)] last:hidden" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

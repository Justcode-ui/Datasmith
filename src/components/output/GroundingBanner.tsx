import React from 'react';
import { Card } from '../ui/Card';
import { ShieldCheck, ShieldAlert, ShieldEllipsis } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GroundingBannerProps {
  locationContext: string;
  jurisdictionConfidence: 'high' | 'medium' | 'low' | null;
  constraintAssumptions: string[];
}

export const GroundingBanner: React.FC<GroundingBannerProps> = ({
  locationContext,
  jurisdictionConfidence,
  constraintAssumptions
}) => {
  if (!jurisdictionConfidence) return null;

  const bgClasses = {
    high: 'bg-[rgba(61,214,140,0.08)] border-[rgba(61,214,140,0.2)]',
    medium: 'bg-[rgba(240,168,50,0.08)] border-[rgba(240,168,50,0.2)]',
    low: 'bg-[rgba(232,68,42,0.08)] border-[rgba(232,68,42,0.2)]'
  };

  const textClasses = {
    high: 'text-[#3dd68c]',
    medium: 'text-[#f0a832]',
    low: 'text-[#e8442a]'
  };

  const Icon = jurisdictionConfidence === 'high' 
    ? ShieldCheck 
    : jurisdictionConfidence === 'medium' 
      ? ShieldEllipsis 
      : ShieldAlert;

  return (
    <Card className={twMerge(clsx(
      "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border",
      bgClasses[jurisdictionConfidence]
    ))}>
      <div className="flex items-start sm:items-center gap-3">
        <Icon size={20} className={clsx("shrink-0 mt-0.5 sm:mt-0", textClasses[jurisdictionConfidence])} />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            Regional grounding active — {locationContext}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Jurisdiction confidence: <span className={clsx("font-bold", textClasses[jurisdictionConfidence])}>{jurisdictionConfidence.toUpperCase()}</span>
            {constraintAssumptions.length > 0 && ` | ${constraintAssumptions.length} assumption${constraintAssumptions.length > 1 ? 's' : ''} flagged`}
          </p>
        </div>
      </div>
      
      <button className="text-[10px] font-bold tracking-widest uppercase text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors px-3 py-2 rounded bg-[var(--color-bg-elevated)]/50 self-start sm:self-auto border border-[var(--color-border-default)]">
        Review Dataset Card
      </button>
    </Card>
  );
};

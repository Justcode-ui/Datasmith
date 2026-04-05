import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { AlertTriangle, Edit3, XCircle } from 'lucide-react';

interface LowConfidenceWarningProps {
  locationContext: string;
  onEditManually: () => void;
  onDisableGrounding: () => void;
}

export const LowConfidenceWarning: React.FC<LowConfidenceWarningProps> = ({
  locationContext,
  onEditManually,
  onDisableGrounding,
}) => {
  return (
    <Card className="flex flex-col gap-4 p-6 bg-red-500/10 border border-red-500/20">
      <div className="flex items-center gap-3">
        <AlertTriangle className="text-red-500 shrink-0" size={24} />
        <h3 className="text-base font-bold text-red-500 tracking-wide">
          LOW CONFIDENCE JURISDICTION
        </h3>
      </div>
      
      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
        Datasmith has limited knowledge of specific regulations for "{locationContext}". 
        The schema below uses best-estimate thresholds that may not reflect actual local rules.
      </p>

      <ul className="text-sm text-[var(--color-text-primary)] list-disc pl-5 mt-2 flex flex-col gap-1">
        <li>Review and manually edit each constraint before generating</li>
        <li>Verify thresholds against official local sources</li>
        <li>Consider disabling regional constraints and using the location as flavor context only</li>
      </ul>

      <div className="flex gap-4 mt-4">
        <Button onClick={onEditManually} variant="secondary" className="gap-2 border-red-500/30 hover:border-red-500 hover:text-red-500 text-sm h-10">
          <Edit3 size={16} /> Edit constraints manually
        </Button>
        <Button onClick={onDisableGrounding} variant="ghost" className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm h-10">
          <XCircle size={16} /> Disable grounding
        </Button>
      </div>
    </Card>
  );
};

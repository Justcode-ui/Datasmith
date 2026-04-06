import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { RegionalConstraint } from '../../store/datasmith';
import { ShieldAlert, ShieldCheck, ShieldEllipsis } from 'lucide-react';

interface ConstraintPanelProps {
  constraints: RegionalConstraint[];
  jurisdictionConfidence: 'high' | 'medium' | 'low' | null;
}

export const ConstraintPanel: React.FC<ConstraintPanelProps> = ({ constraints, jurisdictionConfidence }) => {
  if (!constraints || constraints.length === 0) return null;

  return (
    <Card className="flex flex-col gap-4 p-5 bg-[var(--color-bg-elevated)]/50 border border-[var(--color-border-default)]">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] tracking-wide flex items-center gap-2">
          {jurisdictionConfidence === 'high' && <ShieldCheck size={16} className="text-green-500" />}
          {jurisdictionConfidence === 'medium' && <ShieldEllipsis size={16} className="text-amber-500" />}
          {jurisdictionConfidence === 'low' && <ShieldAlert size={16} className="text-red-500" />}
          Regional Constraints Ruleset
        </h3>
        {jurisdictionConfidence && (
          <Badge variant={jurisdictionConfidence === 'high' ? 'success' : jurisdictionConfidence === 'medium' ? 'warning' : 'danger'}>
            {jurisdictionConfidence.toUpperCase()} CONFIDENCE
          </Badge>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {constraints.map((c, i) => (
          <div key={i} className="flex flex-col gap-1 text-xs border-l-2 border-[var(--color-border-default)] pl-3 py-1">
            <span className="font-mono text-[10px] text-[var(--color-text-disabled)] mb-0.5">
              {c.featureName}
            </span>
            <span className="text-[var(--color-text-primary)] font-medium">
              {c.description}
            </span>
            {c.valueRange && (
              <span className="text-[var(--color-text-secondary)] break-words w-full">
                Range: {c.valueRange}
              </span>
            )}
            <span className="text-[10px] text-[var(--color-text-disabled)] font-mono italic mt-1">
              Source: {c.source}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

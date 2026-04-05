import React from 'react';
import { Feature, FeatureType } from '../../store/datasmith';
import { Card } from '../ui/Card';
import { Trash2, GripVertical } from 'lucide-react';

interface FeatureCardProps {
  feature: Feature;
  onUpdate: (id: string, updates: Partial<Feature>) => void;
  onDelete: (id: string) => void;
  isLowConfidenceMode?: boolean;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onUpdate, onDelete, isLowConfidenceMode }) => {
  return (
    <Card className="p-4 group relative hover:border-[var(--color-accent)]/50 transition-colors">
      <div className="flex gap-4 items-start">
        <div className="pt-2 cursor-grab active:cursor-grabbing text-[var(--color-text-disabled)] group-hover:text-[var(--color-text-secondary)]">
          <GripVertical size={18} />
        </div>
        
        <div className="flex-1 grid grid-cols-[1fr_120px] gap-4">
          <div className="flex flex-col gap-3">
            <input
              className="bg-transparent text-sm font-bold text-[var(--color-text-primary)] border-none outline-none focus:ring-0 p-0"
              value={feature.name}
              onChange={(e) => onUpdate(feature.id, { name: e.target.value })}
              placeholder="feature_name"
            />
            <input
              className="bg-transparent text-xs text-[var(--color-text-secondary)] border-none outline-none focus:ring-0 p-0"
              value={feature.hint}
              onChange={(e) => onUpdate(feature.id, { hint: e.target.value })}
              placeholder="Description hint for values..."
            />
            {isLowConfidenceMode && (
              <>
                <input
                  className="bg-transparent text-xs text-[var(--color-warning)] placeholder:text-[var(--color-warning)]/50 border-l border-[var(--color-warning)] pl-2 outline-none focus:ring-0 p-0"
                  value={feature.constraint || ''}
                  onChange={(e) => onUpdate(feature.id, { constraint: e.target.value })}
                  placeholder="Local constraint rule..."
                />
                <input
                  className="bg-transparent text-xs text-[var(--color-warning)] placeholder:text-[var(--color-warning)]/50 border-l border-[var(--color-warning)] pl-2 outline-none focus:ring-0 p-0"
                  value={feature.value_range || ''}
                  onChange={(e) => onUpdate(feature.id, { value_range: e.target.value })}
                  placeholder="Local value range..."
                />
              </>
            )}
          </div>

          <select
            className="bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] px-2 py-1 text-xs text-[var(--color-text-primary)] outline-none"
            value={feature.type}
            onChange={(e) => onUpdate(feature.id, { type: e.target.value as FeatureType })}
          >
            <option value="string">string</option>
            <option value="integer">integer</option>
            <option value="float">float</option>
            <option value="boolean">boolean</option>
            <option value="category">category</option>
          </select>
        </div>

        <button
          onClick={() => onDelete(feature.id)}
          className="p-1.5 opacity-0 group-hover:opacity-100 hover:text-[var(--color-danger)] transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </Card>
  );
};

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface LabelEditorProps {
  labels: string[];
  onAdd: (label: string) => void;
  onRemove: (label: string) => void;
  onUpdate: (oldLabel: string, newLabel: string) => void;
}

export const LabelEditor: React.FC<LabelEditorProps> = ({ labels, onAdd, onRemove, onUpdate }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue && !labels.includes(inputValue)) {
      onAdd(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {labels.map((label) => (
          <div key={label} className="group relative">
            <input
              className="bg-[rgba(232,100,42,0.1)] text-[var(--color-accent)] border border-[rgba(232,100,42,0.2)] rounded-[var(--radius-pill)] px-3 py-1 text-xs font-bold transition-all focus:ring-1 focus:ring-[var(--color-accent)] outline-none min-w-[60px]"
              value={label}
              onChange={(e) => onUpdate(label, e.target.value)}
            />
            <button
              onClick={() => onRemove(label)}
              className="absolute top-[-4px] right-[-4px] bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-[var(--color-danger)] shadow-sm"
            >
              <X size={10} />
            </button>
          </div>
        ))}
        {labels.length === 0 && (
          <span className="text-[10px] text-[var(--color-text-disabled)] italic py-1">No labels defined...</span>
        )}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 bg-transparent border-b border-[var(--color-border-default)] px-1 py-1 text-xs text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] outline-none transition-colors"
          placeholder="New label..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button size="sm" variant="ghost" className="p-1 h-auto" onClick={handleAdd}>
          <Plus size={14} />
        </Button>
      </div>
    </div>
  );
};

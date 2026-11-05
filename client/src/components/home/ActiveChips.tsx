import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { ActiveFilterChip } from '../../hooks/useBrowseFilters';

interface ActiveChipsProps {
  chips: ActiveFilterChip[];
  onRemoveChip: (chip: ActiveFilterChip) => void;
  onClearAll: () => void;
}

export const ActiveChips: React.FC<ActiveChipsProps> = ({
  chips,
  onRemoveChip,
  onClearAll,
}) => {
  if (chips.length === 0) return null;

  return (
    <div className="flex items-center flex-wrap gap-2 pt-2 animate-in fade-in duration-200">
      <span className="text-xs font-mono uppercase text-slate font-semibold tracking-wider">
        Active Filters:
      </span>

      {chips.map((chip) => (
        <span
          key={chip.id}
          className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-blue-100 text-navy-800 text-xs font-medium border border-blue-600/30 shadow-xs"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={() => onRemoveChip(chip)}
            className="w-4 h-4 rounded-full inline-flex items-center justify-center hover:bg-blue-200 text-navy-800 transition-colors focus-visible:ring-1 focus-visible:ring-blue-600"
            aria-label={`Remove filter ${chip.label}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-crimson-700 bg-crimson-100 hover:bg-crimson-100/80 border border-crimson-600/30 transition-colors btn-tactile focus-visible:ring-1 focus-visible:ring-crimson-600"
        aria-label="Clear all active filters"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Clear all</span>
      </button>
    </div>
  );
};

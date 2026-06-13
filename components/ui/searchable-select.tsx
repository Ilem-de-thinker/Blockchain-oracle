import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Search, ChevronDown, Loader2 } from 'lucide-react';

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  loading = false,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found',
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLabel = options.find((o) => o.value === value)?.label || '';

  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback((val: string) => {
    onChange(val);
    setOpen(false);
  }, [onChange]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => { if (!disabled) setOpen(!open); }}
        disabled={disabled}
        className={cn(
          'h-9 w-full flex items-center justify-between rounded-xl border px-3 text-xs transition-all',
          'bg-surface border-border text-text',
          'focus:outline-none focus:ring-1 focus:ring-primary',
          !value && 'text-text-muted',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span className="truncate">{value ? selectedLabel : placeholder}</span>
        {loading ? (
          <Loader2 size={14} className="animate-spin text-primary shrink-0" />
        ) : (
          <ChevronDown size={14} className={cn('text-text-muted shrink-0 transition-transform', open && 'rotate-180')} />
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-surface shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
            <Search size={14} className="text-text-muted shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent outline-none text-xs text-text placeholder-text-muted"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length > 0 ? (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    'w-full flex items-center px-3 py-2 text-xs rounded-lg transition-colors text-left',
                    opt.value === value
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-text hover:bg-surface-hover'
                  )}
                >
                  {opt.label}
                </button>
              ))
            ) : (
              <p className="px-3 py-4 text-xs text-text-muted text-center">{emptyMessage}</p>
            )}
            {loading && (
              <div className="flex items-center justify-center gap-2 px-3 py-3 text-xs text-text-muted border-t border-border/50">
                <Loader2 size={12} className="animate-spin" />
                Loading...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;

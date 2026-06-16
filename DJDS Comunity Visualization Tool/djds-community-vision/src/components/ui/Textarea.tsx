"use client";

import { CharCount } from "./CharCount";

interface TextareaProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder?: string;
  rows?: number;
  ariaLabel?: string;
  hint?: string;
}

/** Capped textarea with a live counter. The char limit is HARD (BUILD-SPEC §7). */
export function Textarea({
  id,
  value,
  onChange,
  maxLength,
  placeholder,
  rows = 4,
  ariaLabel,
  hint,
}: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <textarea
        id={id}
        value={value}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-label={ariaLabel}
        // Hard-enforce the cap defensively, beyond the maxLength attribute.
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        className="w-full resize-y rounded-[var(--radius-input)] border border-border bg-surface px-4 py-3 t-body text-ink placeholder:text-muted focus-visible:border-accent"
      />
      <div className="flex items-center justify-between gap-3">
        {hint ? (
          <span className="t-caption text-muted">{hint}</span>
        ) : (
          <span />
        )}
        <CharCount value={value} max={maxLength} />
      </div>
    </div>
  );
}

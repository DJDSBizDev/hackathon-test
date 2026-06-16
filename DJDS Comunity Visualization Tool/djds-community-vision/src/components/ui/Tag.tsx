"use client";

/** Selection color families (BUILD-SPEC §7): teal for sensory/feelings, coral for community/features. */
export type TagColor = "teal" | "coral";

interface TagProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  color?: TagColor;
  disabled?: boolean;
}

/*
  Selection state is conveyed by BORDER + FILL (+ a check glyph), never by color
  alone (BUILD-SPEC §2 / WCAG). Pill shape, ≥44px touch target.
*/
const SELECTED: Record<TagColor, string> = {
  teal: "border-teal bg-teal-bg text-teal",
  coral: "border-accent bg-accent/10 text-accent-press",
};

export function Tag({
  label,
  selected,
  onToggle,
  color = "teal",
  disabled = false,
}: TagProps) {
  const isDisabled = disabled && !selected;
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={isDisabled}
      onClick={onToggle}
      className={[
        "inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-pill)] border px-4 py-2",
        "t-small text-left transition-colors duration-150",
        selected
          ? SELECTED[color]
          : "border-transparent bg-chip-bg text-ink-2 hover:border-border-2",
        isDisabled
          ? "cursor-not-allowed opacity-40"
          : "cursor-pointer",
      ].join(" ")}
    >
      {selected && (
        <span aria-hidden className="leading-none">
          ✓
        </span>
      )}
      <span>{label}</span>
    </button>
  );
}

"use client";

import { Tag, type TagColor } from "./Tag";

interface TagGridProps {
  tags: string[];
  selected: string[];
  onToggle: (tag: string) => void;
  color?: TagColor;
  /** Hard cap — when reached, unselected tags become disabled (BUILD-SPEC §7.5/§7.6). */
  cap?: number;
}

export function TagGrid({
  tags,
  selected,
  onToggle,
  color = "teal",
  cap,
}: TagGridProps) {
  const capReached = cap !== undefined && selected.length >= cap;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Tag
          key={tag}
          label={tag}
          color={color}
          selected={selected.includes(tag)}
          disabled={capReached}
          onToggle={() => onToggle(tag)}
        />
      ))}
    </div>
  );
}

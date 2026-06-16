import { en } from "@/i18n/en";

/** Known path for the DJDS brand logo (BUILD-SPEC §4). */
export const LOGO_PATH = "/brand/djds-logo.svg";

/**
 * Single source for the brand mark. Until the licensed DJDS logo asset is
 * dropped at {@link LOGO_PATH}, this renders a text wordmark placeholder
 * (BUILD-SPEC §4). When the asset arrives, swap the wordmark span for an
 * <img src={LOGO_PATH} …/> here — one place, every usage updates.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`t-label font-medium tracking-tight text-ink ${className}`}
      aria-label={en.nav.wordmark}
    >
      {en.nav.wordmark}
    </span>
  );
}

/** Human-readable, URL-safe slug helpers for sessions (BUILD-SPEC §9.1). */

/** Turn a session title into a readable base slug, e.g. "West Oakland" → "west-oakland". */
export function slugify(title: string): string {
  const base = (title || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)
    .replace(/-$/, "");
  return base || "session";
}

/** Short random token (base36) used as a collision-safe slug suffix. */
export function randomToken(len = 4): string {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => (b % 36).toString(36)).join("");
}

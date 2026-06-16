"use client";

/**
 * Download an image (data: URL or remote URL) as a file. Fetching to a blob
 * forces a download even for cross-origin Storage URLs, where a plain anchor
 * `download` attribute would otherwise just open the image.
 */
export async function downloadImage(url: string, filename: string): Promise<void> {
  const res = await fetch(url);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

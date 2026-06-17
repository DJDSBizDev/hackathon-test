/**
 * Photorealistic image generation via Google's Gemini image model
 * (`gemini-2.5-flash-image`). Server-only — reads GEMINI_API_KEY from the
 * environment and is only imported by the /api/generate route handler.
 *
 * (We use the current Gemini image model rather than Imagen on the Gemini API,
 * which is deprecated and shuts down 2026-08-17.)
 */
import { GoogleGenAI } from "@google/genai";
import type { Scale } from "./content";
import type { ContributionInput } from "./types";

const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
const FALLBACK_MODEL =
  process.env.GEMINI_FALLBACK_IMAGE_MODEL || "imagen-4.0-fast-generate-001";

/**
 * DJDS house style — the visual "system prompt" applied to EVERY image so the
 * whole collection feels cohesively DJDS rather than generic AI. Grounded in
 * the brand palette + trauma-informed, restorative-justice values from
 * BUILD-SPEC (§2, §6, §8.4). Edit this one block to retune the look.
 */
export const DJDS_STYLE = [
  "Render in the DJDS house style: an architectural-collage vision with a photorealistic foundation.",
  "Build the scene as a warm, hopeful, photorealistic space in soft golden-hour daylight with a gentle, film-like color grade,",
  "then layer mixed-media collage generously across it — the way an architecture studio builds a hand-made community vision board:",
  "loose pencil and graphite sketch marks and hand-drawn linework; ripped and torn paper edges with layered paper scraps; cut-out 'imported' photographs collaged in; loose watercolor and paint color splotches, washes, and drips; patterned textile or tile insets; and collaged botanical and figure cut-outs.",
  "These collage layers sit on top of and in between the photorealistic elements, with visible seams and torn edges — a deliberate, artful mix of real photography and handmade collage, not a clean photo.",
  "Keep the people and core architecture recognizable and grounded so the scene still reads clearly even as the collage plays across it.",
  "Earthy, dignified palette: terracotta and warm clay, cream and sand, forest and sage green, glowing amber light, and soft dusty-blue accents.",
  "Warm natural materials — light timber and wood, brick, and handcrafted detail — with abundant plants, trees, and cascading greenery.",
  "Spaces feel restorative, safe, and healing — human-scale and clearly made with care for the community, never institutional, carceral, sterile, or corporate.",
  "Diverse, intergenerational, culturally rooted communities present and thriving, shown with warmth, dignity, joy, and agency.",
  "Cohesive, beautiful, and quietly hopeful, as if part of one collection.",
  "Do not include any readable lettering, words, signage, logos, or watermarks.",
].join(" ");

/** Photographic, real-world framing per scale (replaces the SVG composition guidance). */
const SCALE_SCENE: Record<Scale, string> = {
  room: "A single, intimate, human-scale interior room — for example a community room, living room, or classroom.",
  building:
    "A single community building, shown either from outside or in a welcoming key interior space.",
  block:
    "A neighborhood street or city block, viewed at street level with foreground and background depth.",
  city: "A thriving city district or skyline — green, walkable, and alive.",
  planet:
    "A flourishing natural landscape representing a healthy planet — ecosystems, water, sky, and living things.",
};

const SCALE_NOUN: Record<Scale, string> = {
  room: "room",
  building: "building",
  block: "neighborhood block",
  city: "city",
  planet: "planet",
};

function listOr(arr: string[], fallback: string): string {
  return arr.length ? arr.join(", ") : fallback;
}

/**
 * Build a vivid photographic prompt from the community member's answers.
 * We deliberately fold their open text into mood/atmosphere and instruct the
 * model to render NO text — diffusion models render words poorly.
 */
export function assembleImagePrompt(input: ContributionInput): string {
  const scale = input.scale;
  const mood = listOr(input.feelings, "warm, welcoming, and hopeful");
  const senses = [input.sensoryFeelings.join(", "), input.sensoryImagination.trim()]
    .filter(Boolean)
    .join(". ");
  const belonging = input.communityBelonging.length
    ? `The space welcomes and centers: ${input.communityBelonging.join(", ")}. Show diverse, real people present and thriving.`
    : "Show diverse, real people present and thriving.";
  const features = input.features.length
    ? `Visible elements in the scene: ${input.features.join(", ")}.`
    : "";
  const story = input.finalVision.trim()
    ? `The community describes their vision: "${input.finalVision.trim()}"`
    : "";

  return [
    `A photorealistic documentary photograph of a hopeful, real-world ${SCALE_NOUN[scale]} that a community dreams of for the future.`,
    SCALE_SCENE[scale],
    `Emotional atmosphere: ${mood}.`,
    senses ? `Sensory mood: ${senses}.` : "",
    belonging,
    features,
    story,
    DJDS_STYLE,
  ]
    .filter(Boolean)
    .join(" ");
}

export interface GeneratedImage {
  base64: string;
  mimeType: string;
}

function assertConfigured(): void {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key || key.includes("PASTE_")) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Add a real key to .env.local and restart the dev server.",
    );
  }
}

/** Transient errors worth retrying — model overload / rate / server blips. */
function isTransientError(err: unknown): boolean {
  const status = (err as { status?: number } | null)?.status;
  return status === 503 || status === 429 || status === 500;
}

/**
 * Primary path: gemini-2.5-flash-image via generateContent, with bounded
 * auto-retry + backoff. Returns null if it can't produce an image within the
 * deadline (transient overload / empty responses); throws on permanent errors.
 * The deadline leaves room for the Imagen fallback inside the route's limit.
 */
async function generateWithGemini(
  ai: GoogleGenAI,
  prompt: string,
): Promise<GeneratedImage | null> {
  const MAX_ATTEMPTS = 3;
  const DEADLINE_MS = 35_000;
  const start = Date.now();

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: { responseModalities: ["IMAGE"] },
      });
      const parts = res.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        const data = part.inlineData?.data;
        if (data) {
          return { base64: data, mimeType: part.inlineData?.mimeType || "image/png" };
        }
      }
      // No image part — fall through and retry.
    } catch (err) {
      if (!isTransientError(err)) throw err; // permanent error: surface immediately
      console.warn(`[imagen] gemini transient error on attempt ${attempt + 1}`);
    }
    if (attempt === MAX_ATTEMPTS - 1 || Date.now() - start > DEADLINE_MS) break;
    await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
  }
  return null;
}

/** Fallback path: Imagen via generateImages — separate capacity from the primary. */
async function generateWithImagen(
  ai: GoogleGenAI,
  prompt: string,
): Promise<GeneratedImage | null> {
  try {
    const res = await ai.models.generateImages({
      model: FALLBACK_MODEL,
      prompt,
      config: { numberOfImages: 1, aspectRatio: "4:3" },
    });
    const bytes = res?.generatedImages?.[0]?.image?.imageBytes;
    if (bytes) return { base64: bytes, mimeType: "image/png" };
  } catch (err) {
    console.error("[imagen] fallback (Imagen) failed:", err);
  }
  return null;
}

/**
 * Generate one image: try the primary model (with retries); if it's
 * unavailable (e.g. "high demand" 503s), fall back to Imagen so a busy primary
 * rarely blocks a community member's vision.
 */
export async function generateImage(
  input: ContributionInput,
): Promise<GeneratedImage | null> {
  assertConfigured();
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
  });
  const prompt = assembleImagePrompt(input);

  const primary = await generateWithGemini(ai, prompt);
  if (primary) return primary;

  console.warn("[imagen] primary unavailable — falling back to Imagen");
  return await generateWithImagen(ai, prompt);
}

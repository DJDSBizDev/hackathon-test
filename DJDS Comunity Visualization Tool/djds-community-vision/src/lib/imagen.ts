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
    "Style: natural soft daylight, warm and inviting, realistic materials and textures, shallow depth of field, rich detail, wide landscape composition. Absolutely no text, words, signage, logos, or watermarks anywhere in the image.",
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

/**
 * Generate one photorealistic image for the given inputs. Retries once if the
 * model returns no image part (e.g. a transient empty/safety response).
 */
export async function generateImage(
  input: ContributionInput,
): Promise<GeneratedImage | null> {
  assertConfigured();
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
  });
  const prompt = assembleImagePrompt(input);

  for (let attempt = 0; attempt < 2; attempt++) {
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
  }
  return null;
}

import type { Scale } from "./content";

/** The structured answers a community member provides (BUILD-SPEC §8.1 / §12). */
export interface ContributionInput {
  scale: Scale;
  myPeopleAre: string;
  sensoryFeelings: string[];
  communityBelonging: string[];
  sensoryImagination: string;
  feelings: string[];
  features: string[];
  finalVision: string;
  displayName: string;
  language: string;
  sessionId?: string | null;
}

/** A persisted contribution, including the generated image (URL or data: URL). */
export interface Contribution extends ContributionInput {
  id: string;
  imageUrl: string;
  createdAt: string;
  updatedAt?: string;
}

/** Generate endpoint response shape. `imageUrl` is a Storage URL or a data: URL. */
export type GenerateResponse =
  | { success: true; id: string; imageUrl: string; url: string }
  | { success: false; error: string; code: string };

export type ScaleMode = "open" | Scale;
export type Visibility = "private" | "public";
export type SessionStatus = "open" | "closed";

/** A facilitator-created session (BUILD-SPEC §12). PIN hash never leaves the server. */
export interface Session {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  scaleMode: ScaleMode;
  visibility: Visibility;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
}

/** A single vision as shown in the mosaic / dashboard list. */
export interface ContributionSummary {
  id: string;
  displayName: string | null;
  scale: Scale;
  imageUrl: string;
  tags: string[];
  createdAt: string;
}

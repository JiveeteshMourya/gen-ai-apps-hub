import { z } from "zod";
import { MEMORY_CATEGORIES } from "./vault-context.validator";

export const MEMORY_CONTENT_TYPES = [
  "note",
  "conversation",
  "journal",
  "event",
  "observation",
  "document",
  "summary",
  "profile",
] as const;

export type MemoryContentType = (typeof MEMORY_CONTENT_TYPES)[number];

export const MEMORY_PROVENANCES = [
  "user_stated",
  "user_confirmed",
  "app_observed",
  "app_inferred",
  "imported",
] as const;

export type MemoryProvenance = (typeof MEMORY_PROVENANCES)[number];

export const SENSITIVITY_TIERS = ["shareable", "personal", "private", "protected"] as const;
export type SensitivityTier = (typeof SENSITIVITY_TIERS)[number];

export const MEMORY_VISIBILITIES = ["shared", "app_private"] as const;
export type MemoryVisibility = (typeof MEMORY_VISIBILITIES)[number];

export const MEMORY_ENTITY_TYPES = [
  "person",
  "place",
  "organization",
  "product",
  "condition",
  "other",
] as const;
export type MemoryEntityType = (typeof MEMORY_ENTITY_TYPES)[number];

/**
 * Strict schema matching personal-memory-vault docs/public-api.md POST /api/v1/memories
 * Rejects unknown fields with a 400 error.
 * Enforces: exactly one of content or messages must be provided.
 */
export const writeMemorySchema = z
  .strictObject({
    content: z.string().trim().min(1).max(8000).optional(),
    messages: z
      .array(
        z.strictObject({
          role: z.enum(["user", "assistant", "system", "tool"]),
          content: z.string().max(4000),
          timestamp: z.string().optional(),
        })
      )
      .min(1)
      .max(50)
      .optional(),
    contentType: z.enum(MEMORY_CONTENT_TYPES).optional(),
    mode: z.enum(["extract", "verbatim"]).default("extract"),
    provenance: z.enum(MEMORY_PROVENANCES).optional(),
    confidence: z.number().min(0).max(1).optional(),
    importance: z.number().int().min(1).max(5).optional(),
    occurredAt: z.string().optional(),
    timezone: z.string().max(64).optional(),
    expiresAt: z.string().optional(),
    language: z.string().max(35).optional(),
    domain: z.string().trim().min(1).max(40).optional(),
    categoryHints: z.array(z.enum(MEMORY_CATEGORIES)).max(MEMORY_CATEGORIES.length).optional(),
    sensitivityFloor: z.enum(SENSITIVITY_TIERS).optional(),
    tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
    entities: z
      .array(
        z.strictObject({
          name: z.string().trim().min(1).max(100),
          type: z.enum(MEMORY_ENTITY_TYPES),
        })
      )
      .max(20)
      .optional(),
    sessionId: z.string().min(1).max(100).optional(),
    externalId: z.string().min(1).max(100).optional(),
    visibility: z.enum(MEMORY_VISIBILITIES).default("shared"),
    dryRun: z.boolean().default(false),
  })
  .refine(body => (body.content === undefined) !== (body.messages === undefined), {
    message: "Send exactly one of content and messages",
    path: ["content"],
  })
  .refine(body => body.mode === "extract" || (body.content?.length ?? Infinity) <= 2000, {
    message: "Verbatim mode needs content of 2,000 characters or fewer",
    path: ["mode"],
  });

export type WriteMemoryRequest = z.infer<typeof writeMemorySchema>;

export interface StoredMemoryRecord {
  id: string | null;
  content: string;
  category: string;
  sensitivity: string;
  occurredAt?: string;
  expiresAt?: string | null;
  importance?: number;
}

export interface WithheldMemoryRecord {
  category: string;
  reason: "no_write_grant" | "sensitivity_above_cap" | string;
}

export interface WriteMemoryResponseData {
  requestId: string;
  stored: StoredMemoryRecord[];
  withheld: WithheldMemoryRecord[];
  duplicates: number;
  dryRun: boolean;
}

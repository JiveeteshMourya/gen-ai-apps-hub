import { z } from "zod";

export const MEMORY_CATEGORIES = [
  "identity",
  "preferences",
  "goals",
  "interests",
  "activity",
  "sleep",
  "diet",
  "health",
  "mood",
  "work",
  "education",
  "social",
  "relationships",
  "finance",
  "travel",
  "other",
] as const;

export type MemoryCategory = (typeof MEMORY_CATEGORIES)[number];

export const CONTEXT_TASKS = [
  "personalize",
  "answer",
  "recommend",
  "plan",
  "summarize_profile",
  "check_constraints",
] as const;

export type ContextTask = (typeof CONTEXT_TASKS)[number];

export const CONTEXT_ORIGINS = ["any", "other_apps", "this_app"] as const;
export const CONTEXT_RECENCIES = ["recent", "balanced", "all_time"] as const;
export const CONTEXT_DEPTHS = ["quick", "standard", "deep"] as const;
export const CONTEXT_FORMATS = ["paragraph", "bullets"] as const;
export const CONTEXT_PERSPECTIVES = ["third_person", "second_person"] as const;

const categoriesSchema = z.array(z.enum(MEMORY_CATEGORIES)).min(1).max(16);
const termsSchema = (maxLength: number) => z.array(z.string().trim().min(1).max(maxLength)).max(20);

/**
 * Strict schema matching personal-memory-vault docs/public-api.md POST /api/v1/context
 * Unknown fields cause a 400 error in the vault, so this schema is strictly defined.
 */
export const vaultContextRequestSchema = z.strictObject({
  query: z.string().trim().min(1).max(2000),
  purpose: z.string().trim().min(1).max(200).optional(),
  task: z.enum(CONTEXT_TASKS).optional(),
  conversation: z
    .array(
      z.strictObject({
        role: z.enum(["user", "assistant", "system", "tool"]),
        content: z.string().max(4000),
      })
    )
    .max(20)
    .optional(),
  knownFacts: termsSchema(300).optional(),
  keywords: termsSchema(100).optional(),
  entities: termsSchema(100).optional(),
  categories: categoriesSchema.optional(),
  excludeCategories: z.array(z.enum(MEMORY_CATEGORIES)).max(16).optional(),
  origin: z.enum(CONTEXT_ORIGINS).optional(),
  recency: z.enum(CONTEXT_RECENCIES).optional(),
  depth: z.enum(CONTEXT_DEPTHS).optional(),
  minConfidence: z.number().min(0).max(1).optional(),
  maxChars: z.number().int().min(20).max(100).optional(),
  format: z.enum(CONTEXT_FORMATS).optional(),
  perspective: z.enum(CONTEXT_PERSPECTIVES).optional(),
  language: z.string().max(35).optional(),
  timezone: z.string().max(64).optional(),
  includeSources: z.boolean().optional(),
  sessionId: z.string().min(1).max(100).optional(),
});

export type VaultContextRequest = z.infer<typeof vaultContextRequestSchema>;

export interface VaultContextResponseData {
  requestId: string;
  context: string;
  charCount: number;
  coverage?: {
    memoriesUsed: number;
    categories: string[];
    timeSpan: { from?: string; to?: string } | null;
  };
  withheldCategories?: string[];
  sources?: Array<{
    category: string;
    sensitivity: string;
    occurredAt?: string;
  }>;
  generatedAt?: string;
}

export interface VaultApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  code?: string;
  errors?: Array<{ path: string; message: string }>;
}

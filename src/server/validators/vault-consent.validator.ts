import { z } from "zod";
import { MEMORY_CATEGORIES } from "./vault-context.validator";
import { SENSITIVITY_TIERS } from "./vault-write.validator";

export const consentRequestSchema = z.strictObject({
  appId: z.string().trim().min(1, "App ID is required"),
  operation: z.enum(["read", "write"]).default("read"),
  categories: z.array(z.enum(MEMORY_CATEGORIES)).min(1).max(16),
  maxSensitivity: z.enum(SENSITIVITY_TIERS).default("personal"),
  reason: z
    .string()
    .trim()
    .min(1, "Reason is required")
    .max(300, "Reason cannot exceed 300 characters"),
});

export type ConsentRequestInput = z.infer<typeof consentRequestSchema>;

export interface ConsentRequestResponseData {
  id: string;
  status: "pending" | "approved" | "denied";
}

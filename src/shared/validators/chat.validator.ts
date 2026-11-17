import { z } from "zod";

/** Sanitized non-empty message input rule shared across client and server */
export const messageContentSchema = z
  .string()
  .trim()
  .min(1, "Message cannot be empty")
  .max(4000, "Message cannot exceed 4000 characters");

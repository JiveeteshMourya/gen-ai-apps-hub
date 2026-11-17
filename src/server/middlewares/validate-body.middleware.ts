import type { z } from "zod";
import { ApiError } from "@/server/lib/api-error";

export async function validateBody<T extends z.ZodType>(
  request: Request,
  schema: T
): Promise<z.output<T>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiError(400, "validation_error", "The request body must be valid JSON");
  }
  return schema.parse(body);
}

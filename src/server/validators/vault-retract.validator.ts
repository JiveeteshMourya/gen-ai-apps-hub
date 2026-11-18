import { z } from "zod";

export const retractMemorySchema = z
  .strictObject({
    appId: z.string().trim().min(1, "App ID is required"),
    ids: z.array(z.string().uuid()).max(100).optional(),
    externalIds: z.array(z.string().min(1).max(100)).max(100).optional(),
    sessionId: z.string().min(1).max(100).optional(),
  })
  .refine(body => Boolean(body.ids?.length || body.externalIds?.length || body.sessionId), {
    message: "Send at least one of ids, externalIds and sessionId",
  });

export type RetractMemoryInput = z.infer<typeof retractMemorySchema>;

export interface RetractMemoryResponseData {
  deleted: number;
}

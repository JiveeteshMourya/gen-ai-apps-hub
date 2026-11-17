import { z } from "zod";
import { appIdSchema, messageContentSchema } from "@/shared/validators/chat.validator";

export const sendMessageSchema = z.object({
  message: messageContentSchema,
  appId: appIdSchema,
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

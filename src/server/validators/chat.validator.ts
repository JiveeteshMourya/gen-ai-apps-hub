import { z } from "zod";
import { messageContentSchema } from "@/shared/validators/chat.validator";

export const sendMessageSchema = z.object({
  message: messageContentSchema,
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

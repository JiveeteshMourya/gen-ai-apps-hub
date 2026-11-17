import { ApiResponse } from "@/server/lib/api-response";
import { withErrorHandler } from "@/server/middlewares/error-handler.middleware";
import { validateBody } from "@/server/middlewares/validate-body.middleware";
import { chatService } from "@/server/services/chat.service";
import { sendMessageSchema } from "@/server/validators/chat.validator";

export const getChat = withErrorHandler(async () => {
  const history = await chatService.getHistory();
  return new ApiResponse(200, history, "Chat history retrieved");
});

export const postChat = withErrorHandler(async (request: Request) => {
  const { message } = await validateBody(request, sendMessageSchema);
  const reply = await chatService.send(message);
  return new ApiResponse(200, { reply }, "Reply generated");
});

export const deleteChat = withErrorHandler(async () => {
  await chatService.clearHistory();
  return new ApiResponse(200, { ok: true }, "Chat history cleared");
});

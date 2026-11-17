import { ApiError } from "@/server/lib/api-error";
import { ApiResponse } from "@/server/lib/api-response";
import { withErrorHandler } from "@/server/middlewares/error-handler.middleware";
import { validateBody } from "@/server/middlewares/validate-body.middleware";
import { chatService } from "@/server/services/chat.service";
import { sendMessageSchema } from "@/server/validators/chat.validator";

export const getChat = withErrorHandler(async (request: Request) => {
  const url = new URL(request.url);
  const appId = url.searchParams.get("appId");
  if (!appId) {
    throw new ApiError(400, "Missing required query parameter: appId");
  }
  const history = await chatService.getHistory(appId);
  return new ApiResponse(200, history, "Chat history retrieved");
});

export const postChat = withErrorHandler(async (request: Request) => {
  const { message, appId } = await validateBody(request, sendMessageSchema);
  const reply = await chatService.send(appId, message);
  return new ApiResponse(200, { reply }, "Reply generated");
});

export const deleteChat = withErrorHandler(async (request: Request) => {
  const url = new URL(request.url);
  const appId = url.searchParams.get("appId");
  if (!appId) {
    throw new ApiError(400, "Missing required query parameter: appId");
  }
  await chatService.clearHistory(appId);
  return new ApiResponse(200, { ok: true }, `Chat history for ${appId} cleared`);
});

import { ApiError } from "@/server/lib/api-error";
import { ApiResponse } from "@/server/lib/api-response";
import { withErrorHandler } from "@/server/middlewares/error-handler.middleware";
import { validateBody } from "@/server/middlewares/validate-body.middleware";
import { chatService } from "@/server/services/chat.service";
import { sendMessageSchema } from "@/server/validators/chat.validator";

export const getChat = withErrorHandler(async (request: Request) => {
  const url = new URL(request.url);
  const appId = url.searchParams.get("appId");
  const type = url.searchParams.get("type");

  if (!appId) {
    throw new ApiError(400, "Missing required query parameter: appId");
  }

  if (type === "direct") {
    const history = await chatService.getDirectHistory(appId);
    return new ApiResponse(200, history, "Direct chat history retrieved");
  }

  if (type === "memory") {
    const history = await chatService.getMemoryHistory(appId);
    return new ApiResponse(200, history, "Memory chat history retrieved");
  }

  // Returns both direct and memory histories for the dual-widget interface
  const history = await chatService.getAllHistory(appId);
  return new ApiResponse(200, history, "Dual chat history retrieved");
});

export const postChat = withErrorHandler(async (request: Request) => {
  const { message, appId, type } = await validateBody(request, sendMessageSchema);

  const reply =
    type === "memory"
      ? await chatService.sendMemory(appId, message)
      : await chatService.sendDirect(appId, message);

  return new ApiResponse(200, { reply, type }, "Reply generated");
});

export const deleteChat = withErrorHandler(async (request: Request) => {
  const url = new URL(request.url);
  const appId = url.searchParams.get("appId");
  const type = url.searchParams.get("type") ?? "all";

  if (!appId) {
    throw new ApiError(400, "Missing required query parameter: appId");
  }

  if (type === "direct") {
    await chatService.clearDirectHistory(appId);
  } else if (type === "memory") {
    await chatService.clearMemoryHistory(appId);
  } else {
    await chatService.clearAllHistory(appId);
  }

  return new ApiResponse(200, { ok: true, type }, `Chat history (${type}) for ${appId} cleared`);
});

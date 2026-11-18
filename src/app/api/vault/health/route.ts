import { ApiResponse } from "@/server/lib/api-response";
import { withErrorHandler } from "@/server/middlewares/error-handler.middleware";
import { vaultClient } from "@/server/lib/vault-client";

export const GET = withErrorHandler(async () => {
  const result = await vaultClient.checkHealth();
  return new ApiResponse(200, result, result.message);
});

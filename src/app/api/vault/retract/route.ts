import { ApiError } from "@/server/lib/api-error";
import { ApiResponse } from "@/server/lib/api-response";
import { withErrorHandler } from "@/server/middlewares/error-handler.middleware";
import { validateBody } from "@/server/middlewares/validate-body.middleware";
import { vaultClient } from "@/server/lib/vault-client";
import { retractMemorySchema } from "@/server/validators/vault-retract.validator";

export const DELETE = withErrorHandler(async (request: Request) => {
  const { appId, ids, externalIds, sessionId } = await validateBody(request, retractMemorySchema);

  const result = await vaultClient.retractMemories(appId, {
    ids,
    externalIds,
    sessionId: sessionId ?? `hub_${appId}`,
  });

  if (!result.ok) {
    throw new ApiError(400, result.error || "Failed to retract memories from vault");
  }

  return new ApiResponse(
    200,
    { deleted: result.deleted ?? 0 },
    `Retracted ${result.deleted ?? 0} memories from vault`
  );
});

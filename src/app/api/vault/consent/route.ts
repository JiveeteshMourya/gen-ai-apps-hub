import { ApiError } from "@/server/lib/api-error";
import { ApiResponse } from "@/server/lib/api-response";
import { withErrorHandler } from "@/server/middlewares/error-handler.middleware";
import { validateBody } from "@/server/middlewares/validate-body.middleware";
import { vaultClient } from "@/server/lib/vault-client";
import { consentRequestSchema } from "@/server/validators/vault-consent.validator";

export const POST = withErrorHandler(async (request: Request) => {
  const { appId, operation, categories, maxSensitivity, reason } = await validateBody(
    request,
    consentRequestSchema
  );

  const result = await vaultClient.createConsentRequest(appId, {
    operation,
    categories,
    maxSensitivity,
    reason,
  });

  if (!result.ok) {
    throw new ApiError(400, result.error || "Failed to create consent request in vault");
  }

  return new ApiResponse(
    201,
    result.data,
    "Access request submitted to your Personal Memory Vault dashboard"
  );
});

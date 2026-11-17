import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { ApiError } from "@/server/lib/api-error";

export type Controller = (request: Request) => Promise<Response>;

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof z.ZodError) {
    const errors = error.issues.map(issue => ({
      path: issue.path.map(String).join("."),
      message: issue.message,
    }));
    return new ApiError(400, "validation_error", "Invalid request", errors);
  }

  console.error("Unhandled API error:", error);
  return new ApiError(500, "internal_error", "Internal server error");
}

export function errorResponse(error: unknown): Response {
  unstable_rethrow(error);

  const { statusCode, code, message, errors } = toApiError(error);
  return Response.json(
    { statusCode, success: false, message, data: null, code, errors },
    { status: statusCode }
  );
}

export function withErrorHandler(controller: Controller): Controller {
  return async (request: Request) => {
    try {
      return await controller(request);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

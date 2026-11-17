export type ApiFieldError = { path: string; message: string };

export class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message = "Something went wrong",
    readonly errors: ApiFieldError[] = []
  ) {
    super(message);
    this.name = "ApiError";
  }
}

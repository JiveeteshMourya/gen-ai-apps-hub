export class ApiResponse<T> extends Response {
  constructor(statusCode: number, data: T, message = "Success") {
    super(
      JSON.stringify({
        statusCode,
        success: statusCode < 400,
        message,
        data,
      }),
      {
        status: statusCode,
        headers: { "content-type": "application/json" },
      }
    );
  }
}

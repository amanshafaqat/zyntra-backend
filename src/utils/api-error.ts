export class ApiError extends Error {
  readonly statusCode: number;
  readonly errors?: Record<string, string>;

  constructor(statusCode: number, message: string, errors?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: Record<string, string>) {
    return new ApiError(400, message, errors);
  }
  static unauthorized(message = "Authentication required.") {
    return new ApiError(401, message);
  }
  static forbidden(message = "You do not have permission to perform this action.") {
    return new ApiError(403, message);
  }
  static notFound(message = "Resource not found.") {
    return new ApiError(404, message);
  }
  static conflict(message: string) {
    return new ApiError(409, message);
  }
  static unprocessable(message: string, errors?: Record<string, string>) {
    return new ApiError(422, message, errors);
  }
  static tooMany(message = "Too many requests. Slow down and try again shortly.") {
    return new ApiError(429, message);
  }
  static internal(message = "Something went wrong on our side.") {
    return new ApiError(500, message);
  }
}

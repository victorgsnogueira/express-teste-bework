export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends AppError {
  constructor(msg = "Not found") {
    super(msg, 404);
  }
}

export class ForbiddenError extends AppError {
  constructor(msg = "Forbidden") {
    super(msg, 403);
  }
}

export class ConflictError extends AppError {
  constructor(msg = "Conflict") {
    super(msg, 409);
  }
}

export class ValidationError extends AppError {
  constructor(msg: string) {
    super(msg, 422);
  }
}

export class UnauthorizedError extends AppError {
  constructor(msg = "Unauthorized") {
    super(msg, 401);
  }
}

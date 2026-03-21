export class BadRequestError extends Error {
  status = 400;

  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}

export class ConflictError extends Error {
  status = 409;

  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class ForbiddenError extends Error {
  status = 403;

  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}
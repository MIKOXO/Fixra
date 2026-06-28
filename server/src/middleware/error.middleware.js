import { ZodError } from 'zod';

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

const notFound = (_req, _res, next) => {
  next(new AppError('Route not found', 404, 'NOT_FOUND'));
};

const SILENT_CODES = new Set([
  'ACCESS_TOKEN_MISSING',
  'REFRESH_TOKEN_MISSING',
  'ACCESS_TOKEN_INVALID',
  'REFRESH_TOKEN_INVALID',
  'UNAUTHORIZED',
  'INVALID_CREDENTIALS',
  'EMAIL_NOT_VERIFIED',
]);

const errorHandler = (error, _req, res, _next) => {
  const isZodError = error instanceof ZodError;
  const statusCode = error.statusCode || (isZodError ? 400 : 500);
  const code =
    error.code || (isZodError ? 'VALIDATION_ERROR' : statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR');
  const message = error.message || 'Something went wrong';
  const payload = {
    message,
    code,
  };

  if (isZodError) {
    payload.issues = error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
  }

  if (statusCode >= 500 || !SILENT_CODES.has(code)) {
    console.error(error);
  }

  return res.status(statusCode).json(payload);
};

export { AppError, errorHandler, notFound };

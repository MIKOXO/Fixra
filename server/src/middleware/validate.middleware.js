import { AppError } from './error.middleware.js';

const validateRequest = (schemas = {}) => (req, _res, next) => {
  try {
    for (const [segment, schema] of Object.entries(schemas)) {
      if (!schema) {
        continue;
      }

      const result = schema.safeParse(req[segment]);

      if (!result.success) {
        const firstIssue = result.error.issues[0];
        throw new AppError(firstIssue?.message || 'Validation failed', 400, 'VALIDATION_ERROR');
      }

      // Express 5 exposes `req.query` through a getter without a setter.
      // Defining an own property lets validated/coerced values replace the
      // raw request data without throwing on query-string validation.
      Object.defineProperty(req, segment, {
        configurable: true,
        enumerable: true,
        value: result.data,
        writable: true,
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

export default validateRequest;

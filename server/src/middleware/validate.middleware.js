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

      req[segment] = result.data;
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

export default validateRequest;

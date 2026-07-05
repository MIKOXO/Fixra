import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const minuteMs = 60 * 1000;

const jsonHandler = (message, code) => (_req, res) => {
  res.status(429).json({ message, code });
};

export const globalLimiter = rateLimit({
  windowMs: 15 * minuteMs,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    req.path === '/health' ||
    req.path === '/api/auth/refresh',
  handler: jsonHandler('Too many requests. Please try again later.', 'RATE_LIMIT_GLOBAL'),
});

export const loginLimiter = rateLimit({
  windowMs: 15 * minuteMs,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.body?.email) return req.body.email;
    return ipKeyGenerator(req.ip);
  },
  handler: jsonHandler('Too many login attempts for this email. Please try again in 15 minutes.', 'RATE_LIMIT_LOGIN'),
});

export const loginIpLimiter = rateLimit({
  windowMs: 15 * minuteMs,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler('Too many login requests from this IP. Please try again later.', 'RATE_LIMIT_LOGIN_IP'),
});

export const registerLimiter = rateLimit({
  windowMs: 15 * minuteMs,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler('Too many registration attempts. Please try again later.', 'RATE_LIMIT_REGISTER'),
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * minuteMs,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler('Too many password reset requests. Please try again in 15 minutes.', 'RATE_LIMIT_FORGOT_PASSWORD'),
});

export const verifyEmailLimiter = rateLimit({
  windowMs: 15 * minuteMs,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler('Too many verification attempts. Please try again later.', 'RATE_LIMIT_VERIFY_EMAIL'),
});

export const resendVerificationLimiter = rateLimit({
  windowMs: 15 * minuteMs,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler('Too many resend requests. Please try again later.', 'RATE_LIMIT_RESEND'),
});

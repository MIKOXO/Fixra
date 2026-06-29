import { Router } from 'express';
import passport from 'passport';
import authMiddleware from '../middleware/auth.middleware.js';
import validateRequest from '../middleware/validate.middleware.js';
import {
  googleAuth,
  googleCallback,
  getInviteTokenMeta,
  login,
  loginFailed,
  refresh,
  logout,
  me,
  register,
  registerWithInvite,
  verifyEmailHandler,
  resendVerificationHandler,
  requestPasswordResetHandler,
  verifyResetCodeHandler,
  resetPasswordHandler,
} from '../controllers/auth.controller.js';
import { loginSchema, registerSchema, verifyEmailSchema, resendVerificationSchema, requestPasswordResetSchema, verifyResetCodeSchema, resetPasswordSchema } from '../validators/auth.validators.js';
import { inviteTokenQuerySchema, registerWithInviteSchema } from '../validators/invite.validators.js';

const router = Router();
const isGoogleOAuthConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL
);

const googleCallbackAuth = (req, res, next) => {
  if (!isGoogleOAuthConfigured) {
    return res.status(503).json({ message: 'Google OAuth is not configured yet' });
  }

  return passport.authenticate('google', {
    failureRedirect: '/api/auth/login-failed',
    session: false,
  })(req, res, next);
};

router.post('/register', validateRequest({ body: registerSchema }), register);
router.post(
  '/register/invite',
  validateRequest({ body: registerWithInviteSchema }),
  registerWithInvite
);
router.post('/login', validateRequest({ body: loginSchema }), login);
router.get('/invite', validateRequest({ query: inviteTokenQuerySchema }), getInviteTokenMeta);
router.post('/refresh', refresh);
router.post('/verify-email', validateRequest({ body: verifyEmailSchema }), verifyEmailHandler);
router.post('/resend-verification', validateRequest({ body: resendVerificationSchema }), resendVerificationHandler);
router.post('/forgot-password', validateRequest({ body: requestPasswordResetSchema }), requestPasswordResetHandler);
router.post('/verify-reset-code', validateRequest({ body: verifyResetCodeSchema }), verifyResetCodeHandler);
router.post('/reset-password', validateRequest({ body: resetPasswordSchema }), resetPasswordHandler);
router.post('/logout', logout);
router.get('/me', authMiddleware, me);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallbackAuth, googleCallback);
router.get('/login-failed', loginFailed);

export default router;

import passport from 'passport';
import {
  changePassword,
  createUserWithRole,
  hashToken,
  loginWithPassword,
  refreshUserTokens,
  registerLandlord,
  sanitizeUser,
  signTokens,
  storeRefreshToken,
  verifyEmail,
  resendVerificationCode,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
} from '../services/auth.service.js';
import RefreshToken from '../models/RefreshToken.js';
import User from '../models/User.js';
import Property from '../models/Property.js';
import { activateLink } from '../services/contractorLink.service.js';
import {
  buildProfile, validateToken, consumeToken
} from '../services/inviteToken.service.js';

const isGoogleOAuthConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL
);

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
};

const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearAuthCookies = (res) => {
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, profile } = req.body;
    const user = await registerLandlord({ name, email, password, phone, profile });

    return res.status(201).json({
      message: 'Account created. Please check your email for a verification code.',
      expiresAt: user.emailVerificationExpires,
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await loginWithPassword({ email, password });
    const tokens = signTokens(user);

    await storeRefreshToken(user._id, tokens.refreshToken);
    setAuthCookies(res, tokens);

    return res.status(200).json({
      message: 'Login successful',
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const currentRefreshToken = req.cookies?.refreshToken;
    const { user, tokens } = await refreshUserTokens(currentRefreshToken);

    setAuthCookies(res, tokens);

    return res.status(200).json({
      message: 'Session refreshed successfully',
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    await RefreshToken.deleteOne({ tokenHash });
  }
  clearAuthCookies(res);
  return res.status(200).json({ message: 'Logged out successfully' });
};

const me = async (req, res, next) => {
  try {
    const user = req.userDocument;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
};

const googleAuth = (req, res, next) => {
  if (!isGoogleOAuthConfigured) {
    return res.status(503).json({ message: 'Google OAuth is not configured yet' });
  }

  return passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    prompt: 'select_account',
  })(req, res, next);
};

const googleCallback = async (req, res, next) => {
  if (!isGoogleOAuthConfigured) {
    return res.status(503).json({ message: 'Google OAuth is not configured yet' });
  }

  try {
    const user = req.user;
    const tokens = signTokens(user);

    await storeRefreshToken(user._id, tokens.refreshToken);
    setAuthCookies(res, tokens);

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(`${clientUrl}/auth/callback`);
  } catch (error) {
    return next(error);
  }
};

const registerWithInvite = async (req, res, next) => {
  try {
    const { token } = req.query;
    const { name, password, phone } = req.body;

    const invite = await validateToken(token);

    const user = await createUserWithRole({
      name,
      email: invite.email,
      password,
      phone,
      role: invite.role,
      profile: buildProfile(invite.role, invite.meta),
    });

    await consumeToken(invite._id);

    if (invite.role === 'CONTRACTOR' && invite.meta?.landlordId) {
      await activateLink(user._id, invite.meta.landlordId);
    }

    return res.status(201).json({
      message: 'Account created. Please check your email for a verification code.',
      expiresAt: user.emailVerificationExpires,
    });
  } catch (error) {
    return next(error);
  }
};

const loginFailed = (_req, res) => {
  return res.status(401).json({ message: 'Google authentication failed' });
};

const getInviteTokenMeta = async (req, res, next) => {
  try {
    const { token } = req.query;
    const invite = await validateToken(token);
    const meta = { ...(invite.meta || {}) };

    if (meta.landlordId) {
      const landlord = await User.findById(meta.landlordId).select('name email').lean();
      if (landlord) {
        meta.landlordName = landlord.name;
        meta.landlordEmail = landlord.email;
      }
    }

    if (meta.propertyId) {
      const property = await Property.findById(meta.propertyId).select('name address').lean();
      if (property) {
        meta.propertyName = property.name;
        meta.propertyHouseNumber = property.address?.houseNumber;
        meta.propertyCity = property.address?.city;
        meta.propertyRegion = property.address?.region;
      }
    }

    return res.status(200).json({
      invite: {
        role: invite.role,
        email: invite.email,
        meta,
        expiresAt: invite.expiresAt,
        isUsed: invite.isUsed,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const verifyEmailHandler = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const user = await verifyEmail(email, code);
    const tokens = signTokens(user);

    await storeRefreshToken(user._id, tokens.refreshToken);
    setAuthCookies(res, tokens);

    return res.status(200).json({
      message: 'Email verified successfully',
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const resendVerificationHandler = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await resendVerificationCode(email);

    return res.status(200).json({
      message: 'Verification code resent. Please check your email.',
      expiresAt: user.emailVerificationExpires,
    });
  } catch (error) {
    return next(error);
  }
};

const requestPasswordResetHandler = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await requestPasswordReset(email);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const verifyResetCodeHandler = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const result = await verifyResetCode(email, code);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const resetPasswordHandler = async (req, res, next) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    const result = await resetPassword(email, resetToken, newPassword);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const changePasswordHandler = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await changePassword(req.user.id, currentPassword, newPassword);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

export {
  changePasswordHandler,
  clearAuthCookies,
  getInviteTokenMeta,
  googleAuth,
  googleCallback,
  login,
  loginFailed,
  refresh,
  register,
  registerWithInvite,
  logout,
  me,
  setAuthCookies,
  verifyEmailHandler,
  resendVerificationHandler,
  requestPasswordResetHandler,
  verifyResetCodeHandler,
  resetPasswordHandler,
};

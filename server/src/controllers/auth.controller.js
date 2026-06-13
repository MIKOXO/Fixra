import passport from 'passport';
import {
  loginWithPassword,
  refreshUserTokens,
  registerLandlord,
  sanitizeUser,
  signTokens,
} from '../services/auth.service.js';

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
    const tokens = signTokens(user);

    setAuthCookies(res, tokens);

    return res.status(201).json({
      message: 'Landlord registered successfully',
      user: sanitizeUser(user),
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

const logout = (_req, res) => {
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
    setAuthCookies(res, tokens);

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(`${clientUrl}/auth/callback`);
  } catch (error) {
    return next(error);
  }
};

const loginFailed = (_req, res) => {
  return res.status(401).json({ message: 'Google authentication failed' });
};

export {
  clearAuthCookies,
  googleAuth,
  googleCallback,
  login,
  loginFailed,
  refresh,
  logout,
  me,
  register,
  setAuthCookies,
};

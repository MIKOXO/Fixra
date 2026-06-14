import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../middleware/error.middleware.js';

const accessTokenTtl = process.env.JWT_EXPIRES_IN || '15m';
const refreshTokenTtl = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const signAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: accessTokenTtl,
  });

const signRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: refreshTokenTtl,
  });

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (_error) {
    throw new AppError('Invalid or expired refresh token', 401, 'REFRESH_TOKEN_INVALID');
  }
};

const signTokens = (user) => {
  const payload = {
    sub: user._id.toString(),
    role: user.role,
    email: user.email,
  };

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
};

const hashPassword = async (password) => bcrypt.hash(password, 12);

const comparePassword = async (password, passwordHash) => bcrypt.compare(password, passwordHash);

const sanitizeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  googleId: user.googleId ?? null,
  phone: user.phone ?? null,
  isActive: user.isActive,
  profile: user.profile ?? {},
  createdAt: user.createdAt,
});

const registerLandlord = async ({ name, email, password, phone, profile = {} }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    throw new AppError('A user with this email already exists', 409, 'EMAIL_EXISTS');
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    name,
    email,
    passwordHash,
    phone,
    role: 'LANDLORD',
    profile,
  });

  return user;
};

const createUserWithRole = async ({ name, email, password, phone, role, profile }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    throw new AppError('A user with this email already exists', 409, 'EMAIL_EXISTS');
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    name,
    email,
    passwordHash,
    phone,
    role,
    profile,
  });

  return user;
};

const loginWithPassword = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

  if (!user || !user.passwordHash) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const isMatch = await comparePassword(password, user.passwordHash);

  if (!isMatch) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  return user;
};

const findOrCreateGoogleUser = async ({ googleId, email, name, profile = {} }) => {
  const normalizedEmail = email.toLowerCase();
  let user = await User.findOne({
    $or: [{ googleId }, { email: normalizedEmail }],
  });

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
    }

    if (!user.name) {
      user.name = name;
    }

    if (!user.profile || Object.keys(user.profile ?? {}).length === 0) {
      user.profile = profile;
    }

    await user.save();
    return user;
  }

  user = await User.create({
    name,
    email: normalizedEmail,
    googleId,
    role: 'LANDLORD',
    profile,
  });

  return user;
};

const refreshUserTokens = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError('Refresh token missing', 401, 'REFRESH_TOKEN_MISSING');
  }

  const decoded = verifyRefreshToken(refreshToken);
  const user = await User.findById(decoded.sub);

  if (!user || !user.isActive) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  }

  return {
    user,
    tokens: signTokens(user),
  };
};

export {
  comparePassword,
  createUserWithRole,
  findOrCreateGoogleUser,
  hashPassword,
  loginWithPassword,
  registerLandlord,
  sanitizeUser,
  signAccessToken,
  signRefreshToken,
  refreshUserTokens,
  signTokens,
  verifyRefreshToken,
};

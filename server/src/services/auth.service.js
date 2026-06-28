import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../middleware/error.middleware.js';
import { sendEmail } from './email.service.js';
import { verificationCodeTemplate } from '../utils/emailTemplates.js';

const accessTokenTtl = process.env.JWT_EXPIRES_IN || '15m';
const refreshTokenTtl = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const verificationCodeExpiryMinutes = parseInt(process.env.VERIFICATION_CODE_EXPIRES_IN, 10) || 10;
const verificationCodeExpiryMs = verificationCodeExpiryMinutes * 60 * 1000;

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
  isEmailVerified: user.isEmailVerified,
  profile: user.profile ?? {},
  createdAt: user.createdAt,
});

const generateVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const hashVerificationCode = async (code) => bcrypt.hash(code, 10);

const compareVerificationCode = async (code, hash) => bcrypt.compare(code, hash);

const sendVerificationEmail = async (user) => {
  const code = generateVerificationCode();
  const hashedCode = await hashVerificationCode(code);

  user.emailVerificationCode = hashedCode;
  user.emailVerificationExpires = new Date(Date.now() + verificationCodeExpiryMs);
  await user.save();

  const { subject, html } = verificationCodeTemplate(code, verificationCodeExpiryMinutes);
  try {
    await sendEmail(user.email, subject, html);
  } catch (error) {
    throw new AppError('Failed to send verification email. Please try again.', 500, 'EMAIL_SEND_FAILED');
  }
};

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

  await sendVerificationEmail(user);

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

  await sendVerificationEmail(user);

  return user;
};

const loginWithPassword = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

  if (!user || !user.passwordHash) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new AppError('Account deactivated', 403, 'ACCOUNT_DEACTIVATED');
  }

  if (!user.isEmailVerified) {
    throw new AppError('Email not verified. Please check your inbox for the verification code.', 403, 'EMAIL_NOT_VERIFIED');
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
    isEmailVerified: true,
  });

  return user;
};

const verifyEmail = async (email, code) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+emailVerificationCode');

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  if (user.isEmailVerified) {
    throw new AppError('Email already verified', 400, 'EMAIL_ALREADY_VERIFIED');
  }

  if (!user.emailVerificationCode || !user.emailVerificationExpires) {
    throw new AppError('No verification code found. Request a new one.', 400, 'NO_VERIFICATION_CODE');
  }

  if (user.emailVerificationExpires < new Date()) {
    throw new AppError('Verification code expired. Request a new one.', 400, 'CODE_EXPIRED');
  }

  const isValid = await compareVerificationCode(code, user.emailVerificationCode);

  if (!isValid) {
    throw new AppError('Invalid verification code', 400, 'INVALID_CODE');
  }

  user.isEmailVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return user;
};

const resendVerificationCode = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  if (user.isEmailVerified) {
    throw new AppError('Email already verified', 400, 'EMAIL_ALREADY_VERIFIED');
  }

  const cooldown = 60 * 1000;
  const lastSent = user.emailVerificationExpires
    ? new Date(user.emailVerificationExpires.getTime() - verificationCodeExpiryMs)
    : null;

  if (lastSent && Date.now() - lastSent.getTime() < cooldown) {
    const remaining = Math.ceil((cooldown - (Date.now() - lastSent.getTime())) / 1000);
    throw new AppError(`Please wait ${remaining} seconds before requesting a new code.`, 429, 'RESEND_COOLDOWN');
  }

  await sendVerificationEmail(user);

  return user;
};

const refreshUserTokens = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError('Refresh token missing', 401, 'REFRESH_TOKEN_MISSING');
  }

  const decoded = verifyRefreshToken(refreshToken);
  const user = await User.findById(decoded.sub);

  if (!user) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  }

  if (!user.isActive) {
    throw new AppError('Account deactivated', 403, 'ACCOUNT_DEACTIVATED');
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
  verifyEmail,
  resendVerificationCode,
};

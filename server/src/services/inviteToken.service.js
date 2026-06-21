import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import InviteToken from '../models/InviteToken.js';
import User from '../models/User.js';
import { AppError } from '../middleware/error.middleware.js';
import { createLink } from './contractorLink.service.js';

const hashToken = (rawToken) =>
  crypto.createHash('sha256').update(rawToken).digest('hex');

const buildProfile = (role, meta) => {
  switch (role) {
    case 'TENANT':
      return {
        landlordId: meta.landlordId || null,
        propertyId: meta.propertyId || null,
        unitId: meta.unitId || null,
      };
    case 'TECHNICIAN':
      return {
        contractorId: meta.contractorId || null,
        specializations: meta.specializations || [],
        isAvailable: true,
      };
    case 'CONTRACTOR':
      return {
        businessName: meta.businessName || '',
        serviceCategories: meta.serviceCategories || [],
        rating: 0,
      };
    default:
      return {};
  }
};

const TOKEN_TTL_MS = (() => {
  const raw = process.env.INVITE_TOKEN_EXPIRES_IN || '72h';
  const match = raw.match(/^(\d+)([smhd])$/);
  if (!match) return 72 * 60 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return value * (multipliers[unit] || 3600000);
})();

const generateToken = async ({ role, invitedBy, email, meta = {} }) => {
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('A user with this email already exists', 409, 'EMAIL_EXISTS');
  }

  const tokenId = crypto.randomBytes(16).toString('hex');

  const rawToken = jwt.sign(
    { sub: tokenId, role, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.INVITE_TOKEN_EXPIRES_IN || '72h' }
  );

  await InviteToken.create({
    token: hashToken(rawToken),
    role,
    invitedBy,
    email,
    meta,
    expiresAt,
  });

  if (role === 'CONTRACTOR') {
    await createLink(invitedBy, email, meta.serviceCategories || []);
  }

  return rawToken;
};

const validateToken = async (rawToken) => {
  if (!rawToken) {
    throw new AppError('Invite token is required', 400, 'TOKEN_REQUIRED');
  }

  const hashedToken = hashToken(rawToken);
  const invite = await InviteToken.findOne({ token: hashedToken });

  if (!invite) {
    throw new AppError('Invalid invite token', 400, 'INVALID_TOKEN');
  }

  if (invite.isUsed) {
    throw new AppError('Invite token has already been used', 400, 'TOKEN_USED');
  }

  if (invite.expiresAt < new Date()) {
    throw new AppError('Invite token has expired', 400, 'TOKEN_EXPIRED');
  }

  return invite;
};

const consumeToken = async (tokenId) => {
  await InviteToken.findByIdAndUpdate(tokenId, { isUsed: true });
};

export { buildProfile, generateToken, validateToken, consumeToken };

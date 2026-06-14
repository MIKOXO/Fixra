import User from '../models/User.js';
import { AppError } from '../middleware/error.middleware.js';

const ALLOWED_UPDATES = {
  LANDLORD: ['name', 'phone', 'profile.companyName'],
  CONTRACTOR: ['name', 'phone', 'profile.businessName', 'profile.serviceCategories'],
  TECHNICIAN: ['name', 'phone', 'profile.specializations', 'profile.isAvailable'],
  TENANT: ['name', 'phone'],
};

const getProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return user;
};

const updateProfile = async (userId, role, data) => {
  const allowedFields = ALLOWED_UPDATES[role];

  if (!allowedFields) {
    throw new AppError('Profile updates not allowed for this role', 403, 'FORBIDDEN');
  }

  const setFields = {};
  for (const field of allowedFields) {
    if (field.startsWith('profile.')) {
      const key = field.slice(8);
      if (data.profile?.[key] !== undefined) {
        setFields[field] = data.profile[key];
      }
    } else if (data[field] !== undefined) {
      setFields[field] = data[field];
    }
  }

  if (Object.keys(setFields).length === 0) {
    throw new AppError('No updatable fields provided', 400, 'NO_UPDATABLE_FIELDS');
  }

  const user = await User.findByIdAndUpdate(userId, { $set: setFields }, { new: true, runValidators: true });

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return user;
};

export { getProfile, updateProfile };

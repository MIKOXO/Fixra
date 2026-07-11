import RefreshToken from '../models/RefreshToken.js';
import User from '../models/User.js';
import { getProfile, updateProfile, deleteAccount } from '../services/user.service.js';
import { sanitizeUser } from '../services/auth.service.js';

const getProfileHandler = async (req, res, next) => {
  try {
    const user = await getProfile(req.user.id);

    return res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
};

const updateProfileHandler = async (req, res, next) => {
  try {
    const user = await updateProfile(req.user.id, req.user.role, req.body);

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
};

const deleteAccountHandler = async (req, res, next) => {
  try {
    await deleteAccount(req.user.id);
    await RefreshToken.deleteMany({ userId: req.user.id });

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    return res.status(200).json({ message: 'Account deleted successfully.' });
  } catch (error) {
    return next(error);
  }
};

const updateFcmTokenHandler = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fcmToken: req.body.fcmToken },
      { new: true }
    );

    return res.status(200).json({
      message: 'FCM token updated successfully',
      fcmToken: user.fcmToken,
    });
  } catch (error) {
    return next(error);
  }
};

export { deleteAccountHandler, getProfileHandler, updateProfileHandler, updateFcmTokenHandler };

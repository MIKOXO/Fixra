import { getProfile, updateProfile } from '../services/user.service.js';
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

export { getProfileHandler, updateProfileHandler };

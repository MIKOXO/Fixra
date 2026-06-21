import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from './error.middleware.js';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      throw new AppError('Access token missing', 401, 'ACCESS_TOKEN_MISSING');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub);

    if (!user) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    if (!user.isActive) {
      throw new AppError('Account deactivated', 403, 'ACCOUNT_DEACTIVATED');
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    };
    req.userDocument = user;

    return next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    return next(new AppError('Invalid or expired access token', 401, 'ACCESS_TOKEN_INVALID'));
  }
};

export default authMiddleware;

import {
  deactivateUser,
  getAllLandlords,
  getAllUsers,
  getPlatformStats,
  reactivateUser,
} from '../services/admin.service.js';
import { sanitizeUser } from '../services/auth.service.js';

const listUsers = async (req, res, next) => {
  try {
    const { page, limit, role, isActive } = req.query;
    const filters = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
    };
    if (role) filters.role = role;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const result = await getAllUsers(filters);

    return res.status(200).json({
      users: result.users.map(sanitizeUser),
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

const listLandlords = async (req, res, next) => {
  try {
    const landlords = await getAllLandlords();

    return res.status(200).json({ data: landlords });
  } catch (error) {
    return next(error);
  }
};

const deactivate = async (req, res, next) => {
  try {
    const user = await deactivateUser(req.params.id);

    return res.status(200).json({
      message: 'User deactivated successfully',
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const reactivate = async (req, res, next) => {
  try {
    const user = await reactivateUser(req.params.id);

    return res.status(200).json({
      message: 'User reactivated successfully',
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const platformStats = async (req, res, next) => {
  try {
    const stats = await getPlatformStats();

    return res.status(200).json({ data: stats });
  } catch (error) {
    return next(error);
  }
};

export { deactivate, listLandlords, listUsers, platformStats, reactivate };

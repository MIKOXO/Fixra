import {
  deactivateUser,
  getAllLandlords,
  getAllUsers,
  getPlatformStats,
  getAdminProperties,
  getAdminTickets,
  getAttentionItems,
  getUserGrowth,
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

const userGrowth = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const data = await getUserGrowth(days);

    return res.status(200).json({ data });
  } catch (error) {
    return next(error);
  }
};

const attentionItems = async (req, res, next) => {
  try {
    const data = await getAttentionItems();

    return res.status(200).json({ data });
  } catch (error) {
    return next(error);
  }
};

const adminProperties = async (req, res, next) => {
  try {
    const { page, limit, region, city } = req.query;
    const filters = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
    };
    if (region) filters.region = region;
    if (city) filters.city = city;

    const result = await getAdminProperties(filters);

    return res.status(200).json({
      properties: result.properties,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

const adminTickets = async (req, res, next) => {
  try {
    const { page, limit, status, category, priority } = req.query;
    const filters = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
    };
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (priority) filters.priority = priority;

    const result = await getAdminTickets(filters);

    return res.status(200).json({
      tickets: result.tickets,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

export {
  deactivate,
  listLandlords,
  listUsers,
  platformStats,
  reactivate,
  userGrowth,
  attentionItems,
  adminProperties,
  adminTickets,
};

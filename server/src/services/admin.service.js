import User from '../models/User.js';
import Property from '../models/Property.js';
import Ticket from '../models/Ticket.js';
import ContractorLandlordLink from '../models/ContractorLandlordLink.js';
import { AppError } from '../middleware/error.middleware.js';

const getAllUsers = async ({ page = 1, limit = 20, role, isActive }) => {
  const query = {};
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive;

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

const getAllLandlords = async () => {
  const landlords = await User.aggregate([
    { $match: { role: 'LANDLORD' } },
    {
      $lookup: {
        from: 'properties',
        localField: '_id',
        foreignField: 'landlordId',
        as: 'properties',
      },
    },
    { $addFields: { propertyCount: { $size: '$properties' } } },
    { $project: { passwordHash: 0, properties: 0 } },
    { $sort: { createdAt: -1 } },
  ]);

  return landlords;
};

const deactivateUser = async (userId) => {
  const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return user;
};

const reactivateUser = async (userId) => {
  const user = await User.findByIdAndUpdate(userId, { isActive: true }, { new: true });

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return user;
};

const getPlatformStats = async () => {
  const [usersByRole, totalProperties, ticketsByStatus, activeLinks] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Property.countDocuments(),
    Ticket.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ContractorLandlordLink.countDocuments({ status: 'ACTIVE' }),
  ]);

  return {
    usersByRole: usersByRole.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {}),
    totalProperties,
    ticketsByStatus: ticketsByStatus.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {}),
    activeContractorLinks: activeLinks,
  };
};

const getUserGrowth = async (days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const results = await User.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', count: 1 } },
  ]);

  return results;
};

const getAttentionItems = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const fortyEightHoursAgo = new Date();
  fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

  const [recentDeactivations, staleTickets, pendingContractorLinks] = await Promise.all([
    User.find({ isActive: false, updatedAt: { $gte: sevenDaysAgo } })
      .select('-passwordHash')
      .lean(),

    Ticket.find({ status: 'REPORTED', createdAt: { $lt: fortyEightHoursAgo } })
      .populate({ path: 'propertyId', select: 'name address landlordId' })
      .populate({ path: 'tenantId', select: 'name email phone' })
      .lean(),

    ContractorLandlordLink.find({ status: 'PENDING', invitedAt: { $lt: sevenDaysAgo } })
      .populate({ path: 'contractorId', select: 'name email' })
      .populate({ path: 'landlordId', select: 'name email' })
      .lean(),
  ]);

  return { recentDeactivations, staleTickets, pendingContractorLinks };
};

const getAdminProperties = async ({ page = 1, limit = 20, region, city }) => {
  const query = {};
  if (region) query['address.region'] = region;
  if (city) query['address.city'] = city;

  const skip = (page - 1) * limit;

  const [properties, total] = await Promise.all([
    Property.find(query)
      .populate({ path: 'landlordId', select: 'name email phone' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Property.countDocuments(query),
  ]);

  return {
    properties,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

const getAdminTickets = async ({ page = 1, limit = 20, status, category, priority }) => {
  const query = {};
  if (status) query.status = status;
  if (category) query.category = category;
  if (priority) query.priority = priority;

  const skip = (page - 1) * limit;

  const [tickets, total] = await Promise.all([
    Ticket.find(query)
      .populate({ path: 'propertyId', select: 'name address' })
      .populate({ path: 'tenantId', select: 'name email phone' })
      .populate({ path: 'landlordId', select: 'name email phone' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Ticket.countDocuments(query),
  ]);

  return {
    tickets,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

export {
  deactivateUser,
  getAllLandlords,
  getAllUsers,
  getPlatformStats,
  getUserGrowth,
  getAttentionItems,
  getAdminProperties,
  getAdminTickets,
  reactivateUser,
};

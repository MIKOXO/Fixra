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

export { deactivateUser, getAllLandlords, getAllUsers, getPlatformStats, reactivateUser };

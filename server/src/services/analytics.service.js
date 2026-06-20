import mongoose from 'mongoose';
import Ticket from '../models/Ticket.js';
import Job from '../models/Job.js';

const getAvgResolutionTime = async (landlordId, propertyId) => {
  const match = { landlordId: new mongoose.Types.ObjectId(landlordId) };
  if (propertyId) match.propertyId = new mongoose.Types.ObjectId(propertyId);

  const results = await Ticket.aggregate([
    { $match: match },
    { $match: { 'auditTrail.toStatus': 'RESOLVED' } },
    {
      $addFields: {
        resolvedAt: {
          $min: {
            $map: {
              input: {
                $filter: {
                  input: '$auditTrail',
                  as: 'entry',
                  cond: { $eq: ['$$entry.toStatus', 'RESOLVED'] },
                },
              },
              as: 'entry',
              in: '$$entry.timestamp',
            },
          },
        },
      },
    },
    {
      $addFields: {
        resolutionHours: {
          $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 1000 * 60 * 60],
        },
      },
    },
    {
      $group: {
        _id: '$propertyId',
        avgResolutionHours: { $avg: '$resolutionHours' },
        ticketCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'properties',
        localField: '_id',
        foreignField: '_id',
        as: 'property',
      },
    },
    { $unwind: { path: '$property', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        propertyId: '$_id',
        propertyName: '$property.name',
        avgResolutionHours: { $round: ['$avgResolutionHours', 1] },
        ticketCount: 1,
      },
    },
    { $sort: { avgResolutionHours: -1 } },
  ]);

  return results;
};

const getTechnicianPerformance = async (landlordId) => {
  const results = await Ticket.aggregate([
    { $match: { landlordId: new mongoose.Types.ObjectId(landlordId), technicianId: { $ne: null } } },
    {
      $addFields: {
        firstResolvedAt: {
          $min: {
            $map: {
              input: {
                $filter: {
                  input: '$auditTrail',
                  as: 'entry',
                  cond: { $eq: ['$$entry.toStatus', 'RESOLVED'] },
                },
              },
              as: 'entry',
              in: '$$entry.timestamp',
            },
          },
        },
      },
    },
    {
      $addFields: {
        resolutionHours: {
          $cond: [
            { $ne: ['$firstResolvedAt', null] },
            { $divide: [{ $subtract: ['$firstResolvedAt', '$createdAt'] }, 1000 * 60 * 60] },
            null,
          ],
        },
      },
    },
    {
      $group: {
        _id: '$technicianId',
        totalAssigned: { $sum: 1 },
        resolvedCount: { $sum: { $cond: [{ $in: ['$status', ['RESOLVED', 'CLOSED']] }, 1, 0] } },
        avgResolutionHours: { $avg: '$resolutionHours' },
        reopenedCount: {
          $sum: {
            $cond: [{
              $gt: [{
                $size: {
                  $filter: {
                    input: '$auditTrail',
                    as: 'entry',
                    cond: {
                      $and: [
                        { $eq: ['$$entry.fromStatus', 'PENDING_REVIEW'] },
                        { $eq: ['$$entry.toStatus', 'ASSIGNED'] },
                      ],
                    },
                  },
                },
              }, 0],
            }, 1, 0],
          },
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'technician',
      },
    },
    { $unwind: { path: '$technician', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        technicianId: '$_id',
        technicianName: '$technician.name',
        technicianEmail: '$technician.email',
        totalAssigned: 1,
        resolvedCount: 1,
        avgResolutionHours: {
          $cond: [{ $ne: ['$avgResolutionHours', null] }, { $round: ['$avgResolutionHours', 1] }, null],
        },
        reopenedCount: 1,
      },
    },
    { $sort: { resolvedCount: -1 } },
  ]);

  return results;
};

const getCostPerProperty = async (landlordId) => {
  const results = await Job.aggregate([
    {
      $lookup: {
        from: 'tickets',
        localField: 'ticketId',
        foreignField: '_id',
        as: 'ticket',
      },
    },
    { $unwind: '$ticket' },
    { $match: { 'ticket.landlordId': new mongoose.Types.ObjectId(landlordId) } },
    {
      $group: {
        _id: '$ticket.propertyId',
        totalCost: { $sum: '$estimatedCost' },
        jobCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'properties',
        localField: '_id',
        foreignField: '_id',
        as: 'property',
      },
    },
    { $unwind: { path: '$property', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        propertyId: '$_id',
        propertyName: '$property.name',
        totalCost: { $round: ['$totalCost', 2] },
        jobCount: 1,
      },
    },
    { $sort: { totalCost: -1 } },
  ]);

  return results;
};

const getMaintenanceFrequency = async (landlordId) => {
  const results = await Ticket.aggregate([
    { $match: { landlordId: new mongoose.Types.ObjectId(landlordId) } },
    {
      $group: {
        _id: { unitId: '$unitId', category: '$category' },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    {
      $project: {
        _id: 0,
        unitId: '$_id.unitId',
        category: '$_id.category',
        count: 1,
      },
    },
  ]);

  return results;
};

export { getAvgResolutionTime, getCostPerProperty, getMaintenanceFrequency, getTechnicianPerformance };

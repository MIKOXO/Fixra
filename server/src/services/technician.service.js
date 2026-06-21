import User from '../models/User.js';
import { AppError } from '../middleware/error.middleware.js';

const getTechniciansByContractor = async (contractorId) => {
  const technicians = await User.find({
    role: 'TECHNICIAN',
    'profile.contractorId': contractorId,
  }).select('-passwordHash');

  return technicians;
};

const removeTechnician = async (technicianId, contractorId) => {
  const technician = await User.findOne({
    _id: technicianId,
    role: 'TECHNICIAN',
    'profile.contractorId': contractorId,
  });

  if (!technician) {
    throw new AppError('Technician not found', 404, 'TECHNICIAN_NOT_FOUND');
  }

  technician.isActive = false;
  await technician.save();

  return technician;
};

const updateTechnicianAvailability = async (technicianId, contractorId, isAvailable) => {
  const technician = await User.findOneAndUpdate(
    {
      _id: technicianId,
      role: 'TECHNICIAN',
      'profile.contractorId': contractorId,
    },
    { 'profile.isAvailable': isAvailable },
    { new: true }
  ).select('-passwordHash');

  if (!technician) {
    throw new AppError('Technician not found', 404, 'TECHNICIAN_NOT_FOUND');
  }

  return technician;
};

export { getTechniciansByContractor, removeTechnician, updateTechnicianAvailability };

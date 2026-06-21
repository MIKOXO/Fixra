import User from '../models/User.js';
import ContractorLandlordLink from '../models/ContractorLandlordLink.js';
import { AppError } from '../middleware/error.middleware.js';

const createLink = async (landlordId, contractorEmail, serviceCategories = []) => {
  const normalizedEmail = contractorEmail.toLowerCase();

  const existing = await ContractorLandlordLink.findOne({
    landlordId,
    contractorEmail: normalizedEmail,
    status: { $in: ['PENDING', 'ACTIVE'] },
  });

  if (existing) {
    throw new AppError('A pending or active link already exists for this contractor', 409, 'LINK_EXISTS');
  }

  const link = await ContractorLandlordLink.create({
    landlordId,
    contractorEmail: normalizedEmail,
    serviceCategories,
    status: 'PENDING',
    invitedAt: new Date(),
  });

  return link;
};

const activateLink = async (contractorId, landlordId) => {
  const contractor = await User.findById(contractorId);
  if (!contractor) {
    throw new AppError('Contractor not found', 404, 'CONTRACTOR_NOT_FOUND');
  }

  const link = await ContractorLandlordLink.findOneAndUpdate(
    {
      contractorEmail: contractor.email.toLowerCase(),
      landlordId,
      status: 'PENDING',
    },
    { status: 'ACTIVE', contractorId, joinedAt: new Date() },
    { new: true }
  );

  if (!link) {
    throw new AppError('No pending link found for this contractor and landlord', 404, 'LINK_NOT_FOUND');
  }

  return link;
};

const revokeLink = async (linkId, landlordId) => {
  const link = await ContractorLandlordLink.findOneAndUpdate(
    { _id: linkId, landlordId, status: 'ACTIVE' },
    { status: 'REVOKED' },
    { new: true }
  );

  if (!link) {
    throw new AppError('Active link not found', 404, 'LINK_NOT_FOUND');
  }

  return link;
};

const getContractorsByLandlord = async (landlordId) => {
  const links = await ContractorLandlordLink.find({ landlordId, status: 'ACTIVE' })
    .populate('contractorId', 'name email phone profile.businessName')
    .sort({ joinedAt: -1 });

  return links;
};

const getLandlordsByContractor = async (contractorId) => {
  const links = await ContractorLandlordLink.find({ contractorId, status: 'ACTIVE' })
    .populate('landlordId', 'name email phone')
    .sort({ joinedAt: -1 });

  return links;
};

const isLinked = async (contractorId, landlordId) => {
  const link = await ContractorLandlordLink.findOne({
    contractorId,
    landlordId,
    status: 'ACTIVE',
  });

  return !!link;
};

export { activateLink, createLink, getContractorsByLandlord, getLandlordsByContractor, isLinked, revokeLink };

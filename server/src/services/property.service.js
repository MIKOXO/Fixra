import Property from '../models/Property.js';
import User from '../models/User.js';
import { AppError } from '../middleware/error.middleware.js';
import { uploadToCloudinary } from './upload.service.js';

const createProperty = async (landlordId, data) => {
  const property = await Property.create({ ...data, landlordId });
  return property;
};

const getProperties = async (landlordId) => {
  const properties = await Property.find({ landlordId }).sort({ createdAt: -1 });
  return properties;
};

const getPropertyById = async (propertyId, landlordId) => {
  const property = await Property.findOne({ _id: propertyId, landlordId });

  if (!property) {
    throw new AppError('Property not found', 404, 'PROPERTY_NOT_FOUND');
  }

  return property;
};

const updateProperty = async (propertyId, landlordId, data) => {
  const property = await Property.findOneAndUpdate({ _id: propertyId, landlordId }, { $set: data }, { new: true, runValidators: true });

  if (!property) {
    throw new AppError('Property not found', 404, 'PROPERTY_NOT_FOUND');
  }

  return property;
};

const deleteProperty = async (propertyId, landlordId) => {
  const property = await Property.findOneAndDelete({ _id: propertyId, landlordId });

  if (!property) {
    throw new AppError('Property not found', 404, 'PROPERTY_NOT_FOUND');
  }

  return property;
};

const assignTenant = async (propertyId, landlordId, tenantId) => {
  const tenant = await User.findOne({ _id: tenantId, role: 'TENANT' });

  if (!tenant) {
    throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
  }

  const property = await Property.findOne({ _id: propertyId, landlordId });

  if (!property) {
    throw new AppError('Property not found', 404, 'PROPERTY_NOT_FOUND');
  }

  if (property.isOccupied) {
    throw new AppError('Property is already occupied', 400, 'PROPERTY_OCCUPIED');
  }

  property.tenantId = tenantId;
  property.isOccupied = true;
  await property.save();

  tenant.profile = {
    ...tenant.profile,
    landlordId,
    propertyId,
  };
  await tenant.save();

  return property;
};

const uploadPropertyDocuments = async (files) => {
  let titleDeedUrl = '';
  let floorPlanUrl = '';
  const photosUrls = [];

  if (files.titleDeed) {
    const result = await uploadToCloudinary(files.titleDeed[0], 'properties/documents');
    titleDeedUrl = result.url;
  }

  if (files.floorPlan) {
    const result = await uploadToCloudinary(files.floorPlan[0], 'properties/documents');
    floorPlanUrl = result.url;
  }

  if (files.photos) {
    for (const photo of files.photos) {
      const result = await uploadToCloudinary(photo, 'properties/photos');
      photosUrls.push(result.url);
    }
  }

  return { titleDeedUrl, floorPlanUrl, photosUrls };
};

export { assignTenant, createProperty, deleteProperty, getProperties, getPropertyById, updateProperty, uploadPropertyDocuments };

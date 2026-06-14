import Property from '../models/Property.js';
import User from '../models/User.js';
import { AppError } from '../middleware/error.middleware.js';

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

const addUnit = async (propertyId, landlordId, unitData) => {
  const property = await Property.findOne({ _id: propertyId, landlordId });

  if (!property) {
    throw new AppError('Property not found', 404, 'PROPERTY_NOT_FOUND');
  }

  property.units.push(unitData);
  await property.save();

  return property;
};

const updateUnit = async (propertyId, unitId, landlordId, data) => {
  const property = await Property.findOne({ _id: propertyId, landlordId });

  if (!property) {
    throw new AppError('Property not found', 404, 'PROPERTY_NOT_FOUND');
  }

  const unit = property.units.id(unitId);

  if (!unit) {
    throw new AppError('Unit not found', 404, 'UNIT_NOT_FOUND');
  }

  if (data.unitNumber !== undefined) unit.unitNumber = data.unitNumber;
  if (data.isOccupied !== undefined) unit.isOccupied = data.isOccupied;

  await property.save();

  return property;
};

const removeUnit = async (propertyId, unitId, landlordId) => {
  const property = await Property.findOne({ _id: propertyId, landlordId });

  if (!property) {
    throw new AppError('Property not found', 404, 'PROPERTY_NOT_FOUND');
  }

  const unit = property.units.id(unitId);

  if (!unit) {
    throw new AppError('Unit not found', 404, 'UNIT_NOT_FOUND');
  }

  if (unit.isOccupied) {
    throw new AppError('Cannot remove an occupied unit', 400, 'UNIT_OCCUPIED');
  }

  property.units.pull({ _id: unitId });
  await property.save();

  return property;
};

const assignTenant = async (propertyId, unitId, landlordId, tenantId) => {
  const tenant = await User.findOne({ _id: tenantId, role: 'TENANT' });

  if (!tenant) {
    throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
  }

  const property = await Property.findOne({ _id: propertyId, landlordId });

  if (!property) {
    throw new AppError('Property not found', 404, 'PROPERTY_NOT_FOUND');
  }

  const unit = property.units.id(unitId);

  if (!unit) {
    throw new AppError('Unit not found', 404, 'UNIT_NOT_FOUND');
  }

  if (unit.isOccupied) {
    throw new AppError('Unit is already occupied', 400, 'UNIT_OCCUPIED');
  }

  unit.tenantId = tenantId;
  unit.isOccupied = true;
  await property.save();

  tenant.profile = {
    ...tenant.profile,
    landlordId,
    propertyId,
    unitId,
  };
  await tenant.save();

  return property;
};

export { addUnit, assignTenant, createProperty, deleteProperty, getProperties, getPropertyById, removeUnit, updateProperty, updateUnit };

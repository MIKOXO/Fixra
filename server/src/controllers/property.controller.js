import {
  addUnit,
  assignTenant,
  createProperty,
  deleteProperty,
  getProperties,
  getPropertyById,
  removeUnit,
  updateProperty,
  updateUnit,
} from '../services/property.service.js';

const create = async (req, res, next) => {
  try {
    const property = await createProperty(req.user.id, req.body);

    return res.status(201).json({
      message: 'Property created successfully',
      property,
    });
  } catch (error) {
    return next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const properties = await getProperties(req.user.id);

    return res.status(200).json({ properties });
  } catch (error) {
    return next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const property = await getPropertyById(req.params.id, req.user.id);

    return res.status(200).json({ property });
  } catch (error) {
    return next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const property = await updateProperty(req.params.id, req.user.id, req.body);

    return res.status(200).json({
      message: 'Property updated successfully',
      property,
    });
  } catch (error) {
    return next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await deleteProperty(req.params.id, req.user.id);

    return res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

const createUnit = async (req, res, next) => {
  try {
    const property = await addUnit(req.params.id, req.user.id, req.body);

    return res.status(201).json({
      message: 'Unit added successfully',
      property,
    });
  } catch (error) {
    return next(error);
  }
};

const changeUnit = async (req, res, next) => {
  try {
    const property = await updateUnit(req.params.id, req.params.unitId, req.user.id, req.body);

    return res.status(200).json({
      message: 'Unit updated successfully',
      property,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteUnit = async (req, res, next) => {
  try {
    const property = await removeUnit(req.params.id, req.params.unitId, req.user.id);

    return res.status(200).json({
      message: 'Unit removed successfully',
      property,
    });
  } catch (error) {
    return next(error);
  }
};

const assign = async (req, res, next) => {
  try {
    const { tenantId } = req.body;
    const property = await assignTenant(req.params.id, req.params.unitId, req.user.id, tenantId);

    return res.status(200).json({
      message: 'Tenant assigned successfully',
      property,
    });
  } catch (error) {
    return next(error);
  }
};

export { assign, changeUnit, create, createUnit, deleteUnit, getById, list, remove, update };

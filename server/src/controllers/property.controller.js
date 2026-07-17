import {
  assignTenant,
  createProperty,
  deleteProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  uploadPropertyDocuments,
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
    const properties = await getProperties(req.user);

    return res.status(200).json({ properties });
  } catch (error) {
    return next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const property = await getPropertyById(req.params.id, req.user);

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

const assign = async (req, res, next) => {
  try {
    const { tenantId } = req.body;
    const property = await assignTenant(req.params.id, req.user.id, tenantId);

    return res.status(200).json({
      message: 'Tenant assigned successfully',
      property,
    });
  } catch (error) {
    return next(error);
  }
};

const uploadDocs = async (req, res, next) => {
  try {
    const result = await uploadPropertyDocuments(req.files);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

export { assign, create, getById, list, remove, update, uploadDocs };

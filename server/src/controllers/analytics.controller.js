import {
  getAvgResolutionTime,
  getCostPerProperty,
  getMaintenanceFrequency,
  getTechnicianPerformance,
} from '../services/analytics.service.js';

const resolutionTimeHandler = async (req, res, next) => {
  try {
    const { propertyId } = req.query;
    const data = await getAvgResolutionTime(req.user.id, propertyId || undefined);

    return res.status(200).json({ data });
  } catch (error) {
    return next(error);
  }
};

const technicianPerformanceHandler = async (req, res, next) => {
  try {
    const data = await getTechnicianPerformance(req.user.id);

    return res.status(200).json({ data });
  } catch (error) {
    return next(error);
  }
};

const costPerPropertyHandler = async (req, res, next) => {
  try {
    const data = await getCostPerProperty(req.user.id);

    return res.status(200).json({ data });
  } catch (error) {
    return next(error);
  }
};

const maintenanceFrequencyHandler = async (req, res, next) => {
  try {
    const data = await getMaintenanceFrequency(req.user.id);

    return res.status(200).json({ data });
  } catch (error) {
    return next(error);
  }
};

export { costPerPropertyHandler, maintenanceFrequencyHandler, resolutionTimeHandler, technicianPerformanceHandler };

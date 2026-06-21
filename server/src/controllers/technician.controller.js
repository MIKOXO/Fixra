import {
  getTechniciansByContractor,
  removeTechnician,
  updateTechnicianAvailability,
} from '../services/technician.service.js';

const list = async (req, res, next) => {
  try {
    const technicians = await getTechniciansByContractor(req.user.id);

    return res.status(200).json({ data: technicians });
  } catch (error) {
    return next(error);
  }
};

const updateAvailability = async (req, res, next) => {
  try {
    const { isAvailable } = req.body;
    const technician = await updateTechnicianAvailability(req.params.id, req.user.id, isAvailable);

    return res.status(200).json({ data: technician });
  } catch (error) {
    return next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await removeTechnician(req.params.id, req.user.id);

    return res.status(200).json({ message: 'Technician removed successfully' });
  } catch (error) {
    return next(error);
  }
};

export { list, remove, updateAvailability };

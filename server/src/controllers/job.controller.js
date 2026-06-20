import {
  approveEstimate,
  createEstimate,
  dispatchTechnician,
  getJobByTicket,
  rejectEstimate,
} from '../services/job.service.js';

const create = async (req, res, next) => {
  try {
    const { ticketId, estimatedCost } = req.body;
    const job = await createEstimate(req.user.id, ticketId, estimatedCost);

    return res.status(201).json({
      message: 'Estimate created successfully',
      job,
    });
  } catch (error) {
    return next(error);
  }
};

const approve = async (req, res, next) => {
  try {
    const job = await approveEstimate(req.params.id, req.user.id);

    return res.status(200).json({
      message: 'Estimate approved',
      job,
    });
  } catch (error) {
    return next(error);
  }
};

const reject = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const job = await rejectEstimate(req.params.id, req.user.id, reason);

    return res.status(200).json({
      message: 'Estimate rejected',
      job,
    });
  } catch (error) {
    return next(error);
  }
};

const dispatch = async (req, res, next) => {
  try {
    const { technicianId } = req.body;
    const job = await dispatchTechnician(req.params.id, req.user.id, technicianId);

    return res.status(200).json({
      message: 'Technician dispatched successfully',
      job,
    });
  } catch (error) {
    return next(error);
  }
};

const getByTicket = async (req, res, next) => {
  try {
    const job = await getJobByTicket(req.params.ticketId);

    return res.status(200).json({ job });
  } catch (error) {
    return next(error);
  }
};

export { approve, create, dispatch, getByTicket, reject };

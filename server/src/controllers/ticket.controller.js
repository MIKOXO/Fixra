import {
  addNote,
  createTicket,
  getTicketById,
  getTickets,
  transitionStatus,
} from '../services/ticket.service.js';

const create = async (req, res, next) => {
  try {
    const ticket = await createTicket(req.user.id, req.body);

    return res.status(201).json({
      message: 'Ticket created successfully',
      ticket,
    });
  } catch (error) {
    return next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const tickets = await getTickets(req.user);

    return res.status(200).json({ tickets });
  } catch (error) {
    return next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const ticket = await getTicketById(req.params.id, req.user);

    return res.status(200).json({ ticket });
  } catch (error) {
    return next(error);
  }
};

const transition = async (req, res, next) => {
  try {
    const { status: toStatus, reason, contractorId } = req.body;
    const ticket = await transitionStatus(
      req.params.id,
      req.user.id,
      req.user.role,
      toStatus,
      reason,
      { contractorId }
    );

    return res.status(200).json({
      message: `Ticket moved to ${toStatus}`,
      ticket,
    });
  } catch (error) {
    return next(error);
  }
};

const createNote = async (req, res, next) => {
  try {
    const ticket = await addNote(req.params.id, req.user.id, req.body.text);

    return res.status(201).json({
      message: 'Note added successfully',
      ticket,
    });
  } catch (error) {
    return next(error);
  }
};

export { create, createNote, getById, list, transition };

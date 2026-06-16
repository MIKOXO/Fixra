import {
  addAttachment,
  addNote,
  createTicket,
  getTicketById,
  getTickets,
  transitionStatus,
} from '../services/ticket.service.js';
import { uploadToCloudinary } from '../services/upload.service.js';

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

const uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const result = await uploadToCloudinary(req.file, `fixra/tickets/${req.params.id}`);

    const ticket = await addAttachment(req.params.id, req.user, {
      url: result.url,
      type: result.type,
      publicId: result.publicId,
      uploadedBy: req.user.id,
    });

    return res.status(201).json({
      message: 'Attachment uploaded successfully',
      attachment: { url: result.url, type: result.type },
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

export { create, createNote, getById, list, transition, uploadAttachment };

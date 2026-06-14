import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import requireRole from '../middleware/role.middleware.js';
import validateRequest from '../middleware/validate.middleware.js';
import {
  create,
  createNote,
  getById,
  list,
  transition,
} from '../controllers/ticket.controller.js';
import {
  addNoteSchema,
  createTicketSchema,
  transitionStatusSchema,
} from '../validators/ticket.validators.js';

const router = Router();

router.post('/', authMiddleware, requireRole('TENANT'), validateRequest({ body: createTicketSchema }), create);
router.get('/', authMiddleware, list);
router.get('/:id', authMiddleware, getById);
router.patch(
  '/:id/status',
  authMiddleware,
  requireRole('LANDLORD', 'CONTRACTOR', 'TECHNICIAN', 'TENANT', 'SUPER_ADMIN'),
  validateRequest({ body: transitionStatusSchema }),
  transition
);
router.post('/:id/notes', authMiddleware, validateRequest({ body: addNoteSchema }), createNote);

export default router;

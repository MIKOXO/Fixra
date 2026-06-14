import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import requireRole from '../middleware/role.middleware.js';
import validateRequest from '../middleware/validate.middleware.js';
import { createInvite } from '../controllers/invite.controller.js';
import { generateInviteSchema } from '../validators/invite.validators.js';

const router = Router();

router.post(
  '/generate',
  authMiddleware,
  requireRole('LANDLORD', 'CONTRACTOR'),
  validateRequest({ body: generateInviteSchema }),
  createInvite
);

export default router;

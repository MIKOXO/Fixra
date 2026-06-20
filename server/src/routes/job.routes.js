import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import requireRole from '../middleware/role.middleware.js';
import validateRequest from '../middleware/validate.middleware.js';
import { approve, create, dispatch, getByTicket, reject } from '../controllers/job.controller.js';
import {
  createEstimateSchema,
  dispatchTechnicianSchema,
  rejectEstimateSchema,
} from '../validators/job.validators.js';

const router = Router();

router.post('/', authMiddleware, requireRole('CONTRACTOR'), validateRequest({ body: createEstimateSchema }), create);
router.patch('/:id/approve', authMiddleware, requireRole('LANDLORD'), approve);
router.patch('/:id/reject', authMiddleware, requireRole('LANDLORD'), validateRequest({ body: rejectEstimateSchema }), reject);
router.patch('/:id/dispatch', authMiddleware, requireRole('CONTRACTOR'), validateRequest({ body: dispatchTechnicianSchema }), dispatch);
router.get('/ticket/:ticketId', authMiddleware, requireRole('LANDLORD', 'CONTRACTOR', 'TENANT'), getByTicket);

export default router;

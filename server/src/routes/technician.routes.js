import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import requireRole from '../middleware/role.middleware.js';
import { list, remove, updateAvailability } from '../controllers/technician.controller.js';

const router = Router();

router.get('/contractors/technicians', authMiddleware, requireRole('CONTRACTOR'), list);
router.patch('/contractors/technicians/:id/availability', authMiddleware, requireRole('CONTRACTOR'), updateAvailability);
router.delete('/contractors/technicians/:id', authMiddleware, requireRole('CONTRACTOR'), remove);

export default router;

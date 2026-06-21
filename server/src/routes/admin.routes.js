import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import requireRole from '../middleware/role.middleware.js';
import {
  deactivate,
  listLandlords,
  listUsers,
  platformStats,
  reactivate,
} from '../controllers/admin.controller.js';

const router = Router();

router.get('/admin/users', authMiddleware, requireRole('SUPER_ADMIN'), listUsers);
router.get('/admin/landlords', authMiddleware, requireRole('SUPER_ADMIN'), listLandlords);
router.patch('/admin/users/:id/deactivate', authMiddleware, requireRole('SUPER_ADMIN'), deactivate);
router.patch('/admin/users/:id/reactivate', authMiddleware, requireRole('SUPER_ADMIN'), reactivate);
router.get('/admin/stats', authMiddleware, requireRole('SUPER_ADMIN'), platformStats);

export default router;

import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import requireRole from '../middleware/role.middleware.js';
import {
  costPerPropertyHandler,
  maintenanceFrequencyHandler,
  resolutionTimeHandler,
  technicianPerformanceHandler,
} from '../controllers/analytics.controller.js';

const router = Router();

router.get('/resolution-time', authMiddleware, requireRole('LANDLORD'), resolutionTimeHandler);
router.get('/technician-performance', authMiddleware, requireRole('LANDLORD'), technicianPerformanceHandler);
router.get('/cost-per-property', authMiddleware, requireRole('LANDLORD'), costPerPropertyHandler);
router.get('/maintenance-frequency', authMiddleware, requireRole('LANDLORD'), maintenanceFrequencyHandler);

export default router;

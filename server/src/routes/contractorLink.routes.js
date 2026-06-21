import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import requireRole from '../middleware/role.middleware.js';
import { listContractors, listLandlords, revoke } from '../controllers/contractorLink.controller.js';

const router = Router();

router.get('/contractors', authMiddleware, requireRole('LANDLORD'), listContractors);
router.get('/landlords', authMiddleware, requireRole('CONTRACTOR'), listLandlords);
router.delete('/contractors/:linkId', authMiddleware, requireRole('LANDLORD'), revoke);

export default router;

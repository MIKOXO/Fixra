import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import validateRequest from '../middleware/validate.middleware.js';
import { getProfileHandler, updateProfileHandler } from '../controllers/user.controller.js';
import { updateProfileSchema } from '../validators/user.validators.js';

const router = Router();

router.get('/profile', authMiddleware, getProfileHandler);
router.put('/profile', authMiddleware, validateRequest({ body: updateProfileSchema }), updateProfileHandler);

export default router;

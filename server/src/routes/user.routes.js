import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import validateRequest from '../middleware/validate.middleware.js';
import { deleteAccountHandler, getProfileHandler, updateProfileHandler, updateFcmTokenHandler } from '../controllers/user.controller.js';
import { updateProfileSchema, fcmTokenSchema } from '../validators/user.validators.js';

const router = Router();

router.get('/profile', authMiddleware, getProfileHandler);
router.put('/profile', authMiddleware, validateRequest({ body: updateProfileSchema }), updateProfileHandler);
router.post('/fcm-token', authMiddleware, validateRequest({ body: fcmTokenSchema }), updateFcmTokenHandler);
router.delete('/me', authMiddleware, deleteAccountHandler);

export default router;

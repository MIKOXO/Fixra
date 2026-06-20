import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { list, markAllRead, markRead } from '../controllers/notification.controller.js';

const router = Router();

router.get('/', authMiddleware, list);
router.patch('/read-all', authMiddleware, markAllRead);
router.patch('/:id/read', authMiddleware, markRead);

export default router;

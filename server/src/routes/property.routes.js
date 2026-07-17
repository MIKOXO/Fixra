import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import requireRole from '../middleware/role.middleware.js';
import validateRequest from '../middleware/validate.middleware.js';
import upload from '../middleware/upload.middleware.js';
import {
  assign,
  create,
  getById,
  list,
  remove,
  update,
  uploadDocs,
} from '../controllers/property.controller.js';
import {
  assignTenantSchema,
  createPropertySchema,
  updatePropertySchema,
} from '../validators/property.validators.js';

const router = Router();

router.use(authMiddleware);

router.post(
  '/upload-documents',
  requireRole('LANDLORD'),
  upload.fields([
    { name: 'titleDeed', maxCount: 1 },
    { name: 'floorPlan', maxCount: 1 },
    { name: 'photos', maxCount: 5 },
  ]),
  uploadDocs
);
router.post('/', requireRole('LANDLORD'), validateRequest({ body: createPropertySchema }), create);
router.get('/', list);
router.get('/:id', getById);
router.put('/:id', requireRole('LANDLORD'), validateRequest({ body: updatePropertySchema }), update);
router.delete('/:id', requireRole('LANDLORD'), remove);

router.post('/:id/assign', requireRole('LANDLORD'), validateRequest({ body: assignTenantSchema }), assign);

export default router;

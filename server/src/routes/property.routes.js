import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import requireRole from '../middleware/role.middleware.js';
import validateRequest from '../middleware/validate.middleware.js';
import {
  assign,
  changeUnit,
  create,
  createUnit,
  deleteUnit,
  getById,
  list,
  remove,
  update,
} from '../controllers/property.controller.js';
import {
  addUnitSchema,
  assignTenantSchema,
  createPropertySchema,
  updatePropertySchema,
  updateUnitSchema,
} from '../validators/property.validators.js';

const router = Router();

router.use(authMiddleware, requireRole('LANDLORD'));

router.post('/', validateRequest({ body: createPropertySchema }), create);
router.get('/', list);
router.get('/:id', getById);
router.put('/:id', validateRequest({ body: updatePropertySchema }), update);
router.delete('/:id', remove);

router.post('/:id/units', validateRequest({ body: addUnitSchema }), createUnit);
router.put('/:id/units/:unitId', validateRequest({ body: updateUnitSchema }), changeUnit);
router.delete('/:id/units/:unitId', deleteUnit);
router.post('/:id/units/:unitId/assign', validateRequest({ body: assignTenantSchema }), assign);

export default router;

import { z } from 'zod';

const addressSchema = z
  .object({
    street: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
  })
  .optional();

const createPropertySchema = z.object({
  name: z.string().trim().min(1).max(200),
  address: addressSchema,
});

const updatePropertySchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  address: addressSchema,
});

const addUnitSchema = z.object({
  unitNumber: z.string().trim().min(1).max(50),
});

const updateUnitSchema = z.object({
  unitNumber: z.string().trim().min(1).max(50).optional(),
  isOccupied: z.boolean().optional(),
});

const assignTenantSchema = z.object({
  tenantId: z.string(),
});

export { addUnitSchema, assignTenantSchema, createPropertySchema, updatePropertySchema, updateUnitSchema };

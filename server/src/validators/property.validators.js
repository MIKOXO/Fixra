import { z } from 'zod';

const addressSchema = z.object({
  region: z.string().trim().min(1, 'Region is required'),
  city: z.string().trim().min(1, 'City is required'),
  woreda: z.number().int().min(1, 'Woreda is required'),
  kebele: z.number().int().min(1, 'Kebele is required'),
  houseNumber: z.string().trim().min(1, 'House number is required'),
  landmark: z.string().trim().optional().default(''),
});

const documentsSchema = z.object({
  titleDeed: z.string().optional().default(''),
  floorPlan: z.string().optional().default(''),
  photos: z.array(z.string()).optional().default([]),
}).optional();

const createPropertySchema = z.object({
  name: z.string().trim().min(1, 'Property name is required').max(200),
  address: addressSchema,
  propertyType: z.enum(['APARTMENT', 'CONDOMINIUM', 'VILLA', 'G+1', 'G+2', 'G+3', 'G+4']),
  floors: z.number().int().min(1, 'Minimum 1 floor').max(99, 'Maximum 99 floors'),
  floorNumber: z.number().int().min(0).optional(),
  yearBuilt: z.number().int().min(1900).optional(),
  documents: documentsSchema,
  tinNumber: z.string().trim().min(1, 'TIN number is required'),
});

const updatePropertySchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  address: addressSchema.partial().optional(),
  propertyType: z.enum(['APARTMENT', 'CONDOMINIUM', 'VILLA', 'G+1', 'G+2', 'G+3', 'G+4']).optional(),
  floors: z.number().int().min(1).max(99).optional(),
  floorNumber: z.number().int().min(0).optional(),
  yearBuilt: z.number().int().min(1900).optional(),
  documents: documentsSchema,
  tinNumber: z.string().trim().min(1).optional(),
});

const assignTenantSchema = z.object({
  tenantId: z.string(),
});

export { assignTenantSchema, createPropertySchema, updatePropertySchema };

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const addressSchema = new Schema(
  {
    region: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    woreda: { type: Number, required: true },
    kebele: { type: Number, required: true },
    houseNumber: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const documentsSchema = new Schema(
  {
    titleDeed: { type: String, default: '' },
    floorPlan: { type: String, default: '' },
    photos: [{ type: String }],
  },
  { _id: false }
);

const propertySchema = new Schema(
  {
    landlordId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Landlord is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Property name is required'],
      trim: true,
    },
    address: {
      type: addressSchema,
      required: true,
    },
    propertyType: {
      type: String,
      enum: ['APARTMENT', 'CONDOMINIUM', 'VILLA', 'G+1', 'G+2', 'G+3', 'G+4'],
      required: [true, 'Property type is required'],
    },
    floors: {
      type: Number,
      required: [true, 'Number of floors is required'],
      min: 1,
      max: 99,
    },
    floorNumber: {
      type: Number,
      min: 0,
    },
    yearBuilt: {
      type: Number,
      min: 1900,
    },
    documents: {
      type: documentsSchema,
      default: () => ({}),
    },
    tinNumber: {
      type: String,
      required: [true, 'TIN number is required'],
      trim: true,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isOccupied: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Property = model('Property', propertySchema);

export default Property;

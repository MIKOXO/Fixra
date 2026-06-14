import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const addressSchema = new Schema(
  {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
  },
  { _id: false }
);

const unitSchema = new Schema({
  unitNumber: { type: String, required: [true, 'Unit number is required'], trim: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  isOccupied: { type: Boolean, default: false },
});

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
      default: {},
    },
    units: [unitSchema],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Property = model('Property', propertySchema);

export default Property;

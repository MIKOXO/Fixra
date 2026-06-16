import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const attachmentSchema = new Schema(
  {
    url: { type: String, required: true },
    type: { type: String, required: true },
    publicId: { type: String, default: null },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const auditEntrySchema = new Schema(
  {
    fromStatus: { type: String, default: null },
    toStatus: { type: String, required: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const noteSchema = new Schema(
  {
    text: { type: String, required: true },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ticketSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['PLUMBING', 'ELECTRICAL', 'STRUCTURAL', 'APPLIANCE', 'HVAC', 'OTHER'],
      required: [true, 'Category is required'],
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['REPORTED', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_REVIEW', 'RESOLVED', 'CLOSED'],
      default: 'REPORTED',
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property is required'],
    },
    unitId: {
      type: String,
      default: null,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Tenant is required'],
    },
    landlordId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Landlord is required'],
    },
    contractorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    technicianId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      default: null,
    },
    attachments: [attachmentSchema],
    auditTrail: [auditEntrySchema],
    notes: [noteSchema],
    autoCloseAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Ticket = model('Ticket', ticketSchema);

export default Ticket;

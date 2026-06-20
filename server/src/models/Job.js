import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const jobSchema = new Schema(
  {
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
      required: [true, 'Ticket is required'],
      index: true,
    },
    contractorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Contractor is required'],
    },
    technicianId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    estimatedCost: {
      type: Number,
      required: [true, 'Estimated cost is required'],
      min: [0, 'Cost must be a positive number'],
    },
    approvalStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'MOCK_PAID'],
      default: 'UNPAID',
    },
    receiptUrl: {
      type: String,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Job = model('Job', jobSchema);

export default Job;

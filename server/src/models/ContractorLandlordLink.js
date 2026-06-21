import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const contractorLandlordLinkSchema = new Schema(
  {
    contractorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    landlordId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Landlord is required'],
      index: true,
    },
    contractorEmail: {
      type: String,
      required: [true, 'Contractor email is required'],
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACTIVE', 'REVOKED'],
      default: 'PENDING',
    },
    serviceCategories: {
      type: [String],
      default: [],
    },
    invitedAt: {
      type: Date,
      default: Date.now,
    },
    joinedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const ContractorLandlordLink = model('ContractorLandlordLink', contractorLandlordLinkSchema);

export default ContractorLandlordLink;

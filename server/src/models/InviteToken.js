import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const inviteTokenSchema = new Schema(
  {
    token: {
      type: String,
      index: true,
    },
    role: {
      type: String,
      enum: ['TENANT', 'TECHNICIAN', 'CONTRACTOR'],
      required: [true, 'Role is required'],
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Inviter is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    meta: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
  },
  {
    timestamps: true,
  }
);

const InviteToken = model('InviteToken', inviteTokenSchema);

export default InviteToken;

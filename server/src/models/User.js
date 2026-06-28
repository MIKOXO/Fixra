import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'LANDLORD', 'TENANT', 'TECHNICIAN', 'CONTRACTOR'],
      required: true,
      default: 'LANDLORD',
    },
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    fcmToken: {
      type: String,
      default: null,
    },
    profile: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const User = model('User', userSchema);

export default User;

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const notificationSchema = new Schema(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
      index: true,
    },
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
      default: null,
    },
    type: {
      type: String,
      enum: [
        'TICKET_CREATED',
        'TICKET_TRIAGED',
        'TICKET_ASSIGNED',
        'TICKET_IN_PROGRESS',
        'TICKET_PENDING_REVIEW',
        'TICKET_RESOLVED',
        'TICKET_REOPENED',
        'TICKET_CLOSED',
        'ESTIMATE_SUBMITTED',
        'ESTIMATE_APPROVED',
        'ESTIMATE_REJECTED',
      ],
      required: [true, 'Notification type is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    channels: {
      type: [String],
      enum: ['IN_APP', 'EMAIL', 'PUSH'],
      default: ['IN_APP'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    deliveryStatus: {
      type: String,
      enum: ['PENDING', 'SENT', 'FAILED'],
      default: 'PENDING',
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Notification = model('Notification', notificationSchema);

export default Notification;

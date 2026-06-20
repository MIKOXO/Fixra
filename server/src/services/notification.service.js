import Notification from '../models/Notification.js';
import { io } from '../sockets/index.js';
import { AppError } from '../middleware/error.middleware.js';

const createNotification = async (recipientId, ticketId, type, message) => {
  const notification = await Notification.create({
    recipientId,
    ticketId,
    type,
    message,
    channels: ['IN_APP'],
    deliveryStatus: 'SENT',
  });

  if (io) {
    io.to(`user:${recipientId}`).emit('notification:new', notification);
  }

  return notification;
};

const getNotifications = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ recipientId: userId }),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipientId: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
  }

  return notification;
};

const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipientId: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  return { modifiedCount: result.modifiedCount };
};

export { createNotification, getNotifications, markAllAsRead, markAsRead };

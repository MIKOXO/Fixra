import { getNotifications, markAllAsRead, markAsRead } from '../services/notification.service.js';

const list = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const result = await getNotifications(req.user.id, page, limit);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const markRead = async (req, res, next) => {
  try {
    const notification = await markAsRead(req.params.id, req.user.id);

    return res.status(200).json({
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    return next(error);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    const result = await markAllAsRead(req.user.id);

    return res.status(200).json({
      message: 'All notifications marked as read',
      ...result,
    });
  } catch (error) {
    return next(error);
  }
};

export { list, markAllRead, markRead };

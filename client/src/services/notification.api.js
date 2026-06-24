import api from './api';

export const getNotifications = (params) =>
  api.get('/notifications', { params }).then((res) => res.data);

export const markAsRead = (id) =>
  api.patch(`/notifications/${id}/read`).then((res) => res.data);

export const markAllAsRead = () =>
  api.patch('/notifications/read-all').then((res) => res.data);

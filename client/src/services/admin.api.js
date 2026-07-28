import api from './api';

export const getPlatformStats = () =>
  api.get('/admin/stats').then((res) => res.data);

export const getUserGrowth = (days = 30) =>
  api.get('/admin/user-growth', { params: { days } }).then((res) => res.data);

export const getAttentionItems = () =>
  api.get('/admin/attention').then((res) => res.data);

export const getAdminUsers = (params) =>
  api.get('/admin/users', { params }).then((res) => res.data);

export const getAdminProperties = (params) =>
  api.get('/admin/properties', { params }).then((res) => res.data);

export const getAdminTickets = (params) =>
  api.get('/admin/tickets', { params }).then((res) => res.data);

export const deactivateUser = (userId) =>
  api.patch(`/admin/users/${userId}/deactivate`).then((res) => res.data);

export const reactivateUser = (userId) =>
  api.patch(`/admin/users/${userId}/reactivate`).then((res) => res.data);

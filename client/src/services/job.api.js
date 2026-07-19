import api from './api';

export const createEstimate = (data) =>
  api.post('/jobs', data).then((res) => res.data);

export const approveEstimate = (id) =>
  api.patch(`/jobs/${id}/approve`).then((res) => res.data);

export const rejectEstimate = (id, data) =>
  api.patch(`/jobs/${id}/reject`, data).then((res) => res.data);

export const dispatchTechnician = (id, data) =>
  api.patch(`/jobs/${id}/dispatch`, data).then((res) => res.data);

export const getJobByTicket = (ticketId) =>
  api.get(`/jobs/ticket/${ticketId}`).then((res) => res.data);

export const getReceipt = (id) =>
  api.get(`/jobs/${id}/receipt`).then((res) => res.data);

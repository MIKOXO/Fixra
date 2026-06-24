import api from './api';

export const createTicket = (data) =>
  api.post('/tickets', data).then((res) => res.data);

export const getTickets = () =>
  api.get('/tickets').then((res) => res.data);

export const getTicketById = (id) =>
  api.get(`/tickets/${id}`).then((res) => res.data);

export const transitionStatus = (id, data) =>
  api.patch(`/tickets/${id}/status`, data).then((res) => res.data);

export const addNote = (id, data) =>
  api.post(`/tickets/${id}/notes`, data).then((res) => res.data);

export const uploadAttachment = (id, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/tickets/${id}/attachments`, formData).then((res) => res.data);
};

export const rejectResolution = (id, data) =>
  api.patch(`/tickets/${id}/reject-resolution`, data).then((res) => res.data);

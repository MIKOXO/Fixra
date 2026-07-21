import api from './api';

export const getContractors = () =>
  api.get('/contractors').then((res) => res.data);

export const revokeContractor = (linkId) =>
  api.delete(`/contractors/${linkId}`).then((res) => res.data);

export const getTechnicians = () =>
  api.get('/contractors/technicians').then((res) => res.data);

export const updateTechnicianAvailability = (id, isAvailable) =>
  api.patch(`/contractors/technicians/${id}/availability`, { isAvailable }).then((res) => res.data);

export const deactivateTechnician = (id) =>
  api.delete(`/contractors/technicians/${id}`).then((res) => res.data);
import api from './api';

export const getContractors = () =>
  api.get('/contractors').then((res) => res.data);

export const revokeContractor = (linkId) =>
  api.delete(`/contractors/${linkId}`).then((res) => res.data);

export const getTechnicians = () =>
  api.get('/contractors/technicians').then((res) => res.data);
import api from './api';

export const getContractors = () =>
  api.get('/contractors').then((res) => res.data);
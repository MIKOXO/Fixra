import api from './api';

export const getResolutionTime = (params) =>
  api.get('/analytics/resolution-time', { params }).then((res) => res.data);

export const getTechnicianPerformance = (params) =>
  api
    .get('/analytics/technician-performance', { params })
    .then((res) => res.data);

export const getCostPerProperty = (params) =>
  api.get('/analytics/cost-per-property', { params }).then((res) => res.data);

export const getMaintenanceFrequency = (params) =>
  api
    .get('/analytics/maintenance-frequency', { params })
    .then((res) => res.data);

export const getContractorPerformance = () =>
  api.get('/analytics/contractor-performance').then((res) => res.data);

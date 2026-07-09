import api from './api';

export const getResolutionTime = (propertyId) =>
  api
    .get('/analytics/resolution-time', { params: propertyId ? { propertyId } : undefined })
    .then((res) => res.data);

export const getCostPerProperty = () =>
  api.get('/analytics/cost-per-property').then((res) => res.data);

export const getMaintenanceFrequency = () =>
  api.get('/analytics/maintenance-frequency').then((res) => res.data);
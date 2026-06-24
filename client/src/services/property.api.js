import api from './api';

export const createProperty = (data) =>
  api.post('/properties', data).then((res) => res.data);

export const getProperties = () =>
  api.get('/properties').then((res) => res.data);

export const getPropertyById = (id) =>
  api.get(`/properties/${id}`).then((res) => res.data);

export const updateProperty = (id, data) =>
  api.put(`/properties/${id}`, data).then((res) => res.data);

export const deleteProperty = (id) =>
  api.delete(`/properties/${id}`).then((res) => res.data);

export const addUnit = (propertyId, data) =>
  api.post(`/properties/${propertyId}/units`, data).then((res) => res.data);

export const updateUnit = (propertyId, unitId, data) =>
  api.put(`/properties/${propertyId}/units/${unitId}`, data).then((res) => res.data);

export const deleteUnit = (propertyId, unitId) =>
  api.delete(`/properties/${propertyId}/units/${unitId}`).then((res) => res.data);

export const assignTenant = (propertyId, unitId, data) =>
  api.post(`/properties/${propertyId}/units/${unitId}/assign`, data).then((res) => res.data);

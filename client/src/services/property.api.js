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

export const assignTenant = (propertyId, data) =>
  api.post(`/properties/${propertyId}/assign`, data).then((res) => res.data);

export const uploadPropertyDocuments = (formData) =>
  api.post('/properties/upload-documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((res) => res.data);

import api from './api';

export const getProfile = () =>
  api.get('/users/profile').then((res) => res.data);

export const updateProfile = (data) =>
  api.put('/users/profile', data).then((res) => res.data);

export const deleteAccount = () =>
  api.delete('/users/me').then((res) => res.data);

export const saveFcmToken = (data) =>
  api.post('/users/fcm-token', data).then((res) => res.data);

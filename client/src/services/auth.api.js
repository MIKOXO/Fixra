import api from './api';

export const login = (credentials) =>
  api.post('/auth/login', credentials).then((res) => res.data);

export const register = (data) =>
  api.post('/auth/register', data).then((res) => res.data);

export const registerWithInvite = (data, token) =>
  api.post('/auth/register/invite', data, { params: { token } }).then((res) => res.data);

export const logout = () =>
  api.post('/auth/logout').then((res) => res.data);

export const getMe = () =>
  api.get('/auth/me').then((res) => res.data);

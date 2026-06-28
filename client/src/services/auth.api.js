import api from './api';

export const login = (credentials) =>
  api.post('/auth/login', credentials).then((res) => res.data);

export const registerLandlord = (data) =>
  api.post('/auth/register', data).then((res) => res.data);

export const registerWithInvite = (data, token) =>
  api.post('/auth/register/invite', data, { params: { token } }).then((res) => res.data);

export const logout = () =>
  api.post('/auth/logout').then((res) => res.data);

export const fetchCurrentUser = () =>
  api.get('/auth/me').then((res) => res.data);

export const fetchInviteTokenMeta = (token) =>
  api.get('/auth/invite', { params: { token } }).then((res) => res.data);

export const verifyEmail = (email, code) =>
  api.post('/auth/verify-email', { email, code }).then((res) => res.data);

export const resendVerificationCode = (email) =>
  api.post('/auth/resend-verification', { email }).then((res) => res.data);

export const register = registerLandlord;
export const getMe = fetchCurrentUser;

import api from './api';

export const generateInvite = (data) =>
  api.post('/invites/generate', data).then((res) => res.data);
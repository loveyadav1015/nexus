import api from './axios';

export const getChannels = () =>
  api.get('/channels');

export const createChannel = (name, description) =>
  api.post('/channels', { name, description });

export const getChannelMessages = (id, offset = 0) =>
  api.get(`/channels/${id}/messages?limit=50&offset=${offset}`);

export const markChannelRead = (id) =>
  api.post(`/channels/${id}/read`);

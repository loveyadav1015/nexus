import api from './axios';

export const searchMessages = (q, channel_id = null) => {
  const params = { q };
  if (channel_id) params.channel_id = channel_id;
  return api.get('/search', { params });
};

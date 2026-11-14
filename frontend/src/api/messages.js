import api from './axios';

export const sendMessage = (channel_id, content, parent_id = null) =>
  api.post('/messages', { channel_id, content, parent_id });

export const editMessage = (id, content) =>
  api.put(`/messages/${id}`, { content });

export const deleteMessage = (id) =>
  api.delete(`/messages/${id}`);

export const getReplies = (id) =>
  api.get(`/messages/${id}/replies`);

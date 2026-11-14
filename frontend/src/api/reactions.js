import api from './axios';

export const addReaction = (message_id, emoji) =>
  api.post('/reactions', { message_id, emoji });

export const removeReaction = (message_id, emoji) =>
  api.delete('/reactions', { data: { message_id, emoji } });

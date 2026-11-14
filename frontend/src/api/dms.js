import api from './axios';

export const getOrCreateConversation = (userId) =>
  api.get(`/dms/conversation/${userId}`);

export const getDMMessages = (conversationId) =>
  api.get(`/dms/${conversationId}/messages`);

export const sendDMMessage = (conversation_id, content, receiver_id) =>
  api.post('/dms', { conversation_id, content, receiver_id });

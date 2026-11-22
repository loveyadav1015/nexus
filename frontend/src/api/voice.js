import api from './axios';

/**
 * Send a voice command transcript to the assistant backend.
 * @param {Object} payload
 * @param {string} payload.text - Command text (max 1000 characters)
 * @param {Object} [payload.context] - { channelId, dmId }
 * @param {Array} [payload.history] - Rolling history of prior turns
 * @returns {Promise<AxiosResponse<{ reply, uiActions, needsConfirmation, confirmationId, preview }>>}
 */
export const postVoiceCommand = async ({ text, context = {}, history = [] }) => {
  return api.post('/voice/command', { text, context, history });
};

/**
 * Confirm or cancel a pending voice action (such as send_message).
 * @param {Object} payload
 * @param {string} payload.confirmationId - Confirmation identifier
 * @param {boolean} payload.approve - True to execute, false to cancel
 * @returns {Promise<AxiosResponse<{ success, message }>>}
 */
export const postVoiceConfirm = async ({ confirmationId, approve }) => {
  return api.post('/voice/confirm', { confirmationId, approve });
};

/**
 * Upload an audio blob for cloud STT transcription fallback.
 * @param {Blob} audioBlob
 * @returns {Promise<AxiosResponse<{ text: string }>>}
 */
export const uploadVoiceAudio = async (audioBlob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  return api.post('/voice/transcribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

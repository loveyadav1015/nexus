import { create } from 'zustand';

/**
 * Zustand store for Voice Assistant state.
 * Status states: 'idle' | 'listening' | 'thinking' | 'speaking' | 'confirming'
 */
const useVoiceStore = create((set) => ({
  isOpen: false,
  status: 'idle',
  lastTranscript: '',
  reply: '',
  uiActions: [],
  pendingConfirmation: null,
  error: null,
  history: [],
  lastTriggerVoice: false, // Tracks if command came from voice vs typed input

  setOpen: (isOpen) => set({ isOpen }),
  setStatus: (status) => set({ status }),
  setLastTranscript: (lastTranscript) => set({ lastTranscript }),
  setReply: (reply) => set({ reply }),
  setUiActions: (uiActions) => set({ uiActions }),
  setPendingConfirmation: (pendingConfirmation) => set({ pendingConfirmation }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  setLastTriggerVoice: (lastTriggerVoice) => set({ lastTriggerVoice }),

  addHistory: (turn) =>
    set((state) => {
      const updated = [...state.history, turn];
      // Keep rolling window of last 6 turns
      return { history: updated.slice(-6) };
    }),

  clearHistory: () => set({ history: [] }),

  reset: () =>
    set({
      status: 'idle',
      lastTranscript: '',
      reply: '',
      uiActions: [],
      pendingConfirmation: null,
      error: null
    })
}));

export default useVoiceStore;

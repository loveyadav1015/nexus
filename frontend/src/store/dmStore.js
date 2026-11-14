import { create } from 'zustand';

const useDMStore = create((set) => ({
  conversations: [],
  activeConversation: null,
  dmMessages: {},

  setConversations: (conversations) =>
    set({ conversations }),

  setActiveConversation: (conversation) =>
    set({ activeConversation: conversation }),

  setDMMessages: (conversationId, messages) =>
    set((state) => ({
      dmMessages: { ...state.dmMessages, [conversationId]: messages },
    })),

  addDMMessage: (conversationId, message) =>
    set((state) => ({
      dmMessages: {
        ...state.dmMessages,
        [conversationId]: [...(state.dmMessages[conversationId] || []), message],
      },
    })),
}));

export default useDMStore;

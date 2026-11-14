import { create } from 'zustand';

const useMessageStore = create((set) => ({
  messages: {},
  threads: {},
  activeThread: null,

  setMessages: (channelId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [channelId]: messages },
    })),

  addMessage: (channelId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: [...(state.messages[channelId] || []), message],
      },
    })),

  deleteMessage: (channelId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] || []).map((m) =>
          m.id === messageId ? { ...m, is_deleted: true, content: 'This message was deleted' } : m
        ),
      },
    })),

  editMessage: (channelId, updatedMessage) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] || []).map((m) =>
          m.id === updatedMessage.id ? { ...m, content: updatedMessage.content, is_edited: true } : m
        ),
      },
    })),

  addReaction: (channelId, messageId, reaction) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] || []).map((m) => {
          if (m.id !== messageId) return m;
          const existing = m.reactions || [];
          const alreadyExists = existing.some(
            (r) => r.user_id === reaction.userId && r.emoji === reaction.emoji
          );
          if (alreadyExists) return m;
          return {
            ...m,
            reactions: [...existing, { emoji: reaction.emoji, user_id: reaction.userId, id: reaction.id || Date.now() }],
          };
        }),
      },
    })),

  removeReaction: (channelId, messageId, userId, emoji) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] || []).map((m) => {
          if (m.id !== messageId) return m;
          return {
            ...m,
            reactions: (m.reactions || []).filter(
              (r) => !(r.user_id === userId && r.emoji === emoji)
            ),
          };
        }),
      },
    })),

  setThreadMessages: (parentId, messages) =>
    set((state) => ({
      threads: { ...state.threads, [parentId]: messages },
    })),

  addThreadMessage: (parentId, message) =>
    set((state) => ({
      threads: {
        ...state.threads,
        [parentId]: [...(state.threads[parentId] || []), message],
      },
    })),

  setActiveThread: (message) =>
    set({ activeThread: message }),

  clearActiveThread: () =>
    set({ activeThread: null }),
}));

export default useMessageStore;

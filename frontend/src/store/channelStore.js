import { create } from 'zustand';

const useChannelStore = create((set) => ({
  channels: [],
  activeChannelId: null,
  unreadCounts: {},

  setChannels: (channels) => {
    const unreadCounts = {};
    channels.forEach((ch) => {
      unreadCounts[ch.id] = parseInt(ch.unread_count, 10) || 0;
    });
    set({ channels, unreadCounts });
  },

  setActiveChannel: (channelId) =>
    set({ activeChannelId: channelId }),

  addChannel: (channel) =>
    set((state) => ({
      channels: [...state.channels, channel],
    })),

  incrementUnread: (channelId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [channelId]: (state.unreadCounts[channelId] || 0) + 1,
      },
    })),

  clearUnread: (channelId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [channelId]: 0,
      },
    })),
}));

export default useChannelStore;

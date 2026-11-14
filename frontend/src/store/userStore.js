import { create } from 'zustand';

const useUserStore = create((set) => ({
  users: [],
  onlineUsers: {},

  setUsers: (users) => {
    const onlineUsers = {};
    users.forEach((u) => {
      onlineUsers[u.id] = u.status;
    });
    set({ users, onlineUsers });
  },

  updateUserStatus: (userId, status) =>
    set((state) => ({
      onlineUsers: { ...state.onlineUsers, [userId]: status },
      users: state.users.map((u) =>
        u.id === userId ? { ...u, status } : u
      ),
    })),
}));

export default useUserStore;

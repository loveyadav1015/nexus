import { create } from 'zustand';

const useAuthStore = create((set) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch {
    user = null;
  }

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,

    setAuth: (user, token) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false });
    },

    updateUser: (updatedUser) => {
      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    },
  };
});

export default useAuthStore;

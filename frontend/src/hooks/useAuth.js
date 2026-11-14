import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi, register as registerApi } from '../api/auth';
import { connectSocket, disconnectSocket } from '../services/socket';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const useAuth = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);

  const loginUser = useCallback(async (email, password) => {
    try {
      const res = await loginApi(email, password);
      const { user, token } = res.data;
      setAuth(user, token);
      connectSocket(token);
      navigate('/');
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.error || 'Login failed';
      return { success: false, error: msg };
    }
  }, [setAuth, navigate]);

  const registerUser = useCallback(async (username, email, password) => {
    try {
      const res = await registerApi(username, email, password);
      const { user, token } = res.data;
      setAuth(user, token);
      connectSocket(token);
      navigate('/');
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.error || 'Registration failed';
      return { success: false, error: msg };
    }
  }, [setAuth, navigate]);

  const logoutUser = useCallback(() => {
    disconnectSocket();
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  }, [logout, navigate]);

  return { loginUser, registerUser, logoutUser };
};

export default useAuth;

import { create } from 'zustand';
import api from '../services/api';

const getInitialUser = () => {
  try {
    const raw = localStorage.getItem('playrush_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create((set) => ({
  user: getInitialUser(),
  token: localStorage.getItem('playrush_token') || null,
  isLoading: false,
  error: null,

  // Register: username + photo + location
  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/api/auth/register', payload);
      localStorage.setItem('playrush_token', data.data.token);
      localStorage.setItem('playrush_user', JSON.stringify(data.data.user));
      set({ user: data.data.user, token: data.data.token, isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      set({ isLoading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  // Login: username + optional password (required for admin)
  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/api/auth/login', { username, password });
      localStorage.setItem('playrush_token', data.data.token);
      localStorage.setItem('playrush_user', JSON.stringify(data.data.user));
      set({ user: data.data.user, token: data.data.token, isLoading: false });
      return { success: true, user: data.data.user };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ isLoading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  logout: () => {
    localStorage.removeItem('playrush_token');
    localStorage.removeItem('playrush_user');
    set({ user: null, token: null });
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get('/api/auth/me');
      localStorage.setItem('playrush_user', JSON.stringify(data.data));
      set({ user: data.data });
    } catch {
      localStorage.removeItem('playrush_token');
      localStorage.removeItem('playrush_user');
      localStorage.removeItem('playrush_registered');
      set({ user: null, token: null });
    }
  },
}));

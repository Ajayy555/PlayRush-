import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('playrush_token') || null,
  isLoading: false,
  error: null,

  // Register: username + photo + location
  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/api/auth/register', payload);
      localStorage.setItem('playrush_token', data.data.token);
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
    set({ user: null, token: null });
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get('/api/auth/me');
      set({ user: data.data });
    } catch {
      localStorage.removeItem('playrush_token');
      set({ user: null, token: null });
    }
  },
}));

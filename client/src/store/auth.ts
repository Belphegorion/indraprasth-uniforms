import { create } from 'zustand';
import { api } from '../api/client';
import { IAdmin } from '@indraprasth/shared';

interface AuthState {
  user: IAdmin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: IAdmin) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: localStorage.getItem('iu_admin_user')
    ? JSON.parse(localStorage.getItem('iu_admin_user')!)
    : null,
  isAuthenticated: !!localStorage.getItem('iu_admin_user'),
  isLoading: false,

  setAuth: (user) => {
    localStorage.setItem('iu_admin_user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await api.post('/admin/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('iu_admin_user');
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const res = await api.get('/admin/auth/me');
      if (res.data.success && res.data.data.user) {
        set({ user: res.data.data.user, isAuthenticated: true });
        localStorage.setItem('iu_admin_user', JSON.stringify(res.data.data.user));
      }
    } catch (error) {
      localStorage.removeItem('iu_admin_user');
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));

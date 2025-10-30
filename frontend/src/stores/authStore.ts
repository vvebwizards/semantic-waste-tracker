import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

interface AuthState {
  user: null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          console.log('🔗 Connecting to:', API_BASE_URL);
          
          const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          });
          
          const data = await response.json();
          
          if (data.status === 'success') {
            set({ 
              user: data.user,
              isAuthenticated: true,
              isLoading: false 
            });
            return data;
          } else {
            set({ isLoading: false });
            throw new Error(data.message);
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData: any) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });
          
          const data = await response.json();
          
          if (data.status === 'success') {
            set({ isLoading: false });
            return data;
          } else {
            set({ isLoading: false });
            throw new Error(data.message);
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      },

      initializeAuth: () => {
        const { user } = get();
        if (user) {
          set({ isAuthenticated: true });
        }
      }
    }),
    {
      name: 'auth-storage', 
      partialize: (state) => ({ user: state.user }) 
    }
  )
);
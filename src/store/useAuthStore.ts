import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthSession } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  setSession: (session: AuthSession) => Promise<void>;
  updateUser: (partial: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredSession: () => Promise<void>;
}

const STORAGE_KEY = '@vedsarthi_auth_session';

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  token: null,
  refreshToken: null,
  user: null,

  setSession: async (session: AuthSession) => {
    try {
      const activeToken =
        session.tokens?.accessToken ||
        session.accessToken ||
        (session as any).token ||
        null;
      const activeRefreshToken =
        session.tokens?.refreshToken || session.refreshToken || null;

      const normalizedSession: AuthSession = {
        ...session,
        accessToken: activeToken || undefined,
        refreshToken: activeRefreshToken || undefined,
        user: session.user,
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedSession));

      set({
        isAuthenticated: !!(activeToken || session.user),
        token: activeToken,
        refreshToken: activeRefreshToken,
        user: session.user,
        isLoading: false,
      });
    } catch (e) {
      console.error('Failed to save auth session', e);
    }
  },

  updateUser: async (partial: Partial<User>) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...partial };
    set({ user: updatedUser });
    const currentToken = get().token;
    const currentRefreshToken = get().refreshToken;
    if (currentToken || currentRefreshToken || updatedUser) {
      const session: AuthSession = {
        accessToken: currentToken || undefined,
        refreshToken: currentRefreshToken || undefined,
        user: updatedUser,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove auth session', e);
    } finally {
      set({
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        user: null,
        isLoading: false,
      });
    }
  },

  loadStoredSession: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const session: AuthSession = JSON.parse(raw);
        const activeToken =
          session.tokens?.accessToken ||
          session.accessToken ||
          (session as any).token ||
          null;
        const activeRefreshToken =
          session.tokens?.refreshToken || session.refreshToken || null;

        if (activeToken || session.user) {
          set({
            isAuthenticated: true,
            token: activeToken,
            refreshToken: activeRefreshToken,
            user: session.user || null,
            isLoading: false,
          });
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load auth session', e);
    }
    set({
      isLoading: false,
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      user: null,
    });
  },
}));

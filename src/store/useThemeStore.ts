import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'sanctum_dark' | 'auto';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  loadStoredTheme: () => Promise<void>;
}

const STORAGE_KEY = '@vedsarthi_theme_mode';

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'light',

  setMode: async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, mode);
      set({ mode });
    } catch (e) {
      console.error('Failed to save theme mode', e);
    }
  },

  loadStoredTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored && (stored === 'light' || stored === 'sanctum_dark' || stored === 'auto')) {
        set({ mode: stored as ThemeMode });
      }
    } catch (e) {
      console.error('Failed to load theme mode', e);
    }
  },
}));

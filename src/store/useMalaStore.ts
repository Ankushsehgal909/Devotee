import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_MANTRAS } from '../constants/vedic';

interface MalaState {
  currentMantraId: string;
  beadCount: number; // 0 to 108
  currentRound: number; // 1, 2, ...
  targetRounds: number; // default 16 or 108
  totalChantsLifetime: number;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  setMantra: (id: string) => void;
  incrementBead: () => { isMalaCompleted: boolean; currentBead: number; round: number };
  resetCurrentRound: () => void;
  setTargetRounds: (rounds: number) => void;
  toggleHaptics: () => void;
  toggleSound: () => void;
  loadStoredMala: () => Promise<void>;
}

const STORAGE_KEY = '@vedsarthi_mala_state';

export const useMalaStore = create<MalaState>((set, get) => ({
  currentMantraId: DEFAULT_MANTRAS[0].id,
  beadCount: 0,
  currentRound: 1,
  targetRounds: 16,
  totalChantsLifetime: 0,
  hapticsEnabled: true,
  soundEnabled: true,

  setMantra: (id: string) => {
    set({ currentMantraId: id, beadCount: 0, currentRound: 1 });
  },

  incrementBead: () => {
    const current = get().beadCount;
    const lifetime = get().totalChantsLifetime + 1;

    if (current >= 107) {
      // Completed one full round of 108 beads!
      const nextRound = get().currentRound + 1;
      set({
        beadCount: 0,
        currentRound: nextRound,
        totalChantsLifetime: lifetime,
      });
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          lifetime,
          currentMantraId: get().currentMantraId,
        })
      ).catch(console.error);

      return { isMalaCompleted: true, currentBead: 108, round: nextRound - 1 };
    } else {
      const nextBead = current + 1;
      set({
        beadCount: nextBead,
        totalChantsLifetime: lifetime,
      });
      return { isMalaCompleted: false, currentBead: nextBead, round: get().currentRound };
    }
  },

  resetCurrentRound: () => {
    set({ beadCount: 0 });
  },

  setTargetRounds: (rounds: number) => {
    set({ targetRounds: rounds });
  },

  toggleHaptics: () => {
    set({ hapticsEnabled: !get().hapticsEnabled });
  },

  toggleSound: () => {
    set({ soundEnabled: !get().soundEnabled });
  },

  loadStoredMala: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        set({
          totalChantsLifetime: data.lifetime || 0,
          currentMantraId: data.currentMantraId || DEFAULT_MANTRAS[0].id,
        });
      }
    } catch (e) {
      console.error('Failed to load mala state', e);
    }
  },
}));

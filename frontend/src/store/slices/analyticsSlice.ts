/**
 * Analytics slice
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AnalyticsOverview } from '@/types';

interface AnalyticsState {
  overview: AnalyticsOverview | null;
  deckStats: Record<number, any>;
  streak: {
    current: number;
    longest: number;
    startDate: string | null;
  };
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  overview: null,
  deckStats: {},
  streak: {
    current: 0,
    longest: 0,
    startDate: null,
  },
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setOverview: (state, action: PayloadAction<AnalyticsOverview>) => {
      state.overview = action.payload;
    },
    setDeckStats: (state, action: PayloadAction<{ deckId: number; stats: any }>) => {
      state.deckStats[action.payload.deckId] = action.payload.stats;
    },
    setStreak: (
      state,
      action: PayloadAction<{
        current: number;
        longest: number;
        startDate: string | null;
      }>
    ) => {
      state.streak = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setOverview,
  setDeckStats,
  setStreak,
  setLoading,
  setError,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;


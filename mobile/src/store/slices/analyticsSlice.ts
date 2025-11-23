/**
 * Analytics slice for mobile
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AnalyticsOverview } from '@/types';

interface AnalyticsState {
  overview: AnalyticsOverview | null;
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

export const { setOverview, setStreak, setLoading, setError } = analyticsSlice.actions;

export default analyticsSlice.reducer;


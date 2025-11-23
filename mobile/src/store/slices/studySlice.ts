/**
 * Study slice for mobile
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Card, StudySession as StudySessionType } from '@/types';

interface StudyState {
  currentSession: StudySessionType | null;
  queue: Card[];
  currentCardIndex: number;
  sessionStarted: boolean;
  stats: {
    total: number;
    completed: number;
    correct: number;
    incorrect: number;
    startTime: Date | null;
  };
  loading: boolean;
  error: string | null;
}

const initialState: StudyState = {
  currentSession: null,
  queue: [],
  currentCardIndex: 0,
  sessionStarted: false,
  stats: {
    total: 0,
    completed: 0,
    correct: 0,
    incorrect: 0,
    startTime: null,
  },
  loading: false,
  error: null,
};

const studySlice = createSlice({
  name: 'study',
  initialState,
  reducers: {
    setQueue: (state, action: PayloadAction<Card[]>) => {
      state.queue = action.payload;
      state.stats.total = action.payload.length;
      state.currentCardIndex = 0;
    },
    startSession: (state, action: PayloadAction<StudySessionType>) => {
      state.currentSession = action.payload;
      state.sessionStarted = true;
      state.stats.startTime = new Date();
      state.currentCardIndex = 0;
    },
    endSession: (state) => {
      state.sessionStarted = false;
      if (state.currentSession) {
        state.currentSession.end_time = new Date().toISOString();
      }
    },
    nextCard: (state) => {
      if (state.currentCardIndex < state.queue.length - 1) {
        state.currentCardIndex += 1;
      }
    },
    submitReview: (state, action: PayloadAction<{ quality: number }>) => {
      const { quality } = action.payload;
      state.stats.completed += 1;
      if (quality >= 3) {
        state.stats.correct += 1;
      } else {
        state.stats.incorrect += 1;
      }
    },
    resetSession: (state) => {
      state.currentSession = null;
      state.queue = [];
      state.currentCardIndex = 0;
      state.sessionStarted = false;
      state.stats = {
        total: 0,
        completed: 0,
        correct: 0,
        incorrect: 0,
        startTime: null,
      };
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
  setQueue,
  startSession,
  endSession,
  nextCard,
  submitReview,
  resetSession,
  setLoading,
  setError,
} = studySlice.actions;

export default studySlice.reducer;


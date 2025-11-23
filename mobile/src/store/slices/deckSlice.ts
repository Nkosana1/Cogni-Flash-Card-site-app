/**
 * Deck slice for mobile
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Deck } from '@/types';

interface DeckState {
  decks: Deck[];
  currentDeck: Deck | null;
  loading: boolean;
  error: string | null;
}

const initialState: DeckState = {
  decks: [],
  currentDeck: null,
  loading: false,
  error: null,
};

const deckSlice = createSlice({
  name: 'decks',
  initialState,
  reducers: {
    setDecks: (state, action: PayloadAction<Deck[]>) => {
      state.decks = action.payload;
    },
    addDeck: (state, action: PayloadAction<Deck>) => {
      state.decks.push(action.payload);
    },
    updateDeck: (state, action: PayloadAction<Deck>) => {
      const index = state.decks.findIndex((d) => d.id === action.payload.id);
      if (index !== -1) {
        state.decks[index] = action.payload;
      }
    },
    removeDeck: (state, action: PayloadAction<number>) => {
      state.decks = state.decks.filter((d) => d.id !== action.payload);
    },
    setCurrentDeck: (state, action: PayloadAction<Deck | null>) => {
      state.currentDeck = action.payload;
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
  setDecks,
  addDeck,
  updateDeck,
  removeDeck,
  setCurrentDeck,
  setLoading,
  setError,
} = deckSlice.actions;

export default deckSlice.reducer;


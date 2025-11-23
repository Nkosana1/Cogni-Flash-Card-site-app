/**
 * Deck management slice
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Deck } from '@/types';

interface DeckState {
  decks: Deck[];
  currentDeck: Deck | null;
  loading: boolean;
  error: string | null;
  viewMode: 'grid' | 'list';
  searchQuery: string;
  selectedTags: string[];
}

const initialState: DeckState = {
  decks: [],
  currentDeck: null,
  loading: false,
  error: null,
  viewMode: 'grid',
  searchQuery: '',
  selectedTags: [],
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
      if (state.currentDeck?.id === action.payload.id) {
        state.currentDeck = action.payload;
      }
    },
    removeDeck: (state, action: PayloadAction<number>) => {
      state.decks = state.decks.filter((d) => d.id !== action.payload);
      if (state.currentDeck?.id === action.payload) {
        state.currentDeck = null;
      }
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
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedTags: (state, action: PayloadAction<string[]>) => {
      state.selectedTags = action.payload;
    },
    toggleTag: (state, action: PayloadAction<string>) => {
      const index = state.selectedTags.indexOf(action.payload);
      if (index === -1) {
        state.selectedTags.push(action.payload);
      } else {
        state.selectedTags.splice(index, 1);
      }
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
  setViewMode,
  setSearchQuery,
  setSelectedTags,
  toggleTag,
} = deckSlice.actions;

export default deckSlice.reducer;


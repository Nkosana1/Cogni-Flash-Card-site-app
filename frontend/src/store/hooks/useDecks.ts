/**
 * Custom hook for deck management
 */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useGetDecksQuery,
  useGetDeckQuery,
  useCreateDeckMutation,
  useUpdateDeckMutation,
  useDeleteDeckMutation,
  useCloneDeckMutation,
} from '../api/deckApi';
import {
  setDecks,
  setCurrentDeck,
  addDeck,
  updateDeck as updateDeckAction,
  removeDeck,
} from '../slices/deckSlice';
import { RootState } from '../index';
import { Deck } from '@/types';

export const useDecks = () => {
  const dispatch = useDispatch();
  const { decks, currentDeck, viewMode, searchQuery, selectedTags } = useSelector(
    (state: RootState) => state.decks
  );

  const { data: decksData, isLoading, error, refetch } = useGetDecksQuery({
    page: 1,
    per_page: 100,
  });

  const [createDeckMutation] = useCreateDeckMutation();
  const [updateDeckMutation] = useUpdateDeckMutation();
  const [deleteDeckMutation] = useDeleteDeckMutation();
  const [cloneDeckMutation] = useCloneDeckMutation();

  // Sync RTK Query data with Redux state
  useEffect(() => {
    if (decksData?.items) {
      dispatch(setDecks(decksData.items));
    }
  }, [decksData, dispatch]);

  const createDeck = async (deckData: {
    title: string;
    description?: string;
    is_public?: boolean;
    tags?: string[];
    color?: string;
  }) => {
    try {
      const result = await createDeckMutation(deckData).unwrap();
      dispatch(addDeck(result));
      return { success: true, deck: result };
    } catch (err: any) {
      return { success: false, error: err?.data?.error || 'Failed to create deck' };
    }
  };

  const updateDeck = async (deckId: number, updates: Partial<Deck>) => {
    try {
      const result = await updateDeckMutation({ id: deckId, ...updates }).unwrap();
      dispatch(updateDeckAction(result));
      return { success: true, deck: result };
    } catch (err: any) {
      return { success: false, error: err?.data?.error || 'Failed to update deck' };
    }
  };

  const deleteDeck = async (deckId: number) => {
    try {
      await deleteDeckMutation(deckId).unwrap();
      dispatch(removeDeck(deckId));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.data?.error || 'Failed to delete deck' };
    }
  };

  const cloneDeck = async (deckId: number) => {
    try {
      const result = await cloneDeckMutation(deckId).unwrap();
      dispatch(addDeck(result));
      return { success: true, deck: result };
    } catch (err: any) {
      return { success: false, error: err?.data?.error || 'Failed to clone deck' };
    }
  };

  const selectDeck = (deck: Deck | null) => {
    dispatch(setCurrentDeck(deck));
  };

  return {
    decks,
    currentDeck,
    viewMode,
    searchQuery,
    selectedTags,
    isLoading,
    error,
    createDeck,
    updateDeck,
    deleteDeck,
    cloneDeck,
    selectDeck,
    refetch,
  };
};


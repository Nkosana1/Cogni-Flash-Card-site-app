/**
 * Custom hook for study sessions
 */
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useGetStudyQueueQuery,
  useSubmitReviewMutation,
  useGetCurrentSessionQuery,
  useStartSessionMutation,
  useEndSessionMutation,
} from '../api/studyApi';
import {
  setQueue,
  startSession,
  endSession,
  nextCard,
  submitReview as submitReviewAction,
  resetSession,
} from '../slices/studySlice';
import { RootState } from '../index';
import { Card } from '@/types';

export const useStudySession = (deckId?: number) => {
  const dispatch = useDispatch();
  const {
    queue,
    currentCardIndex,
    sessionStarted,
    stats,
    currentSession,
  } = useSelector((state: RootState) => state.study);

  const { data: queueData, isLoading: isLoadingQueue } = useGetStudyQueueQuery(deckId);
  const { data: sessionData } = useGetCurrentSessionQuery(undefined, {
    skip: !sessionStarted,
  });
  const [submitReviewMutation, { isLoading: isSubmitting }] = useSubmitReviewMutation();
  const [startSessionMutation] = useStartSessionMutation();
  const [endSessionMutation] = useEndSessionMutation();

  // Sync queue data
  useEffect(() => {
    if (queueData?.queue) {
      dispatch(setQueue(queueData.queue));
    }
  }, [queueData, dispatch]);

  // Sync session data
  useEffect(() => {
    if (sessionData?.session && !currentSession) {
      dispatch(startSession(sessionData.session));
    }
  }, [sessionData, currentSession, dispatch]);

  const currentCard: Card | undefined = queue[currentCardIndex];

  const handleStartSession = async (deckId: number) => {
    try {
      const result = await startSessionMutation({ deck_id: deckId }).unwrap();
      dispatch(startSession(result.session));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.data?.error || 'Failed to start session' };
    }
  };

  const handleEndSession = async () => {
    try {
      await endSessionMutation().unwrap();
      dispatch(endSession());
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.data?.error || 'Failed to end session' };
    }
  };

  const handleRating = async (quality: number) => {
    if (!currentCard || isSubmitting) return;

    // Optimistic update
    dispatch(submitReviewAction({ quality }));

    try {
      await submitReviewMutation({
        card_id: currentCard.id,
        quality,
      }).unwrap();
      
      // Move to next card if available
      if (currentCardIndex < queue.length - 1) {
        dispatch(nextCard());
      }
      
      return { success: true };
    } catch (err: any) {
      // Revert optimistic update on error
      // Note: RTK Query handles this automatically with onQueryStarted
      return { success: false, error: err?.data?.error || 'Failed to submit review' };
    }
  };

  const reset = () => {
    dispatch(resetSession());
  };

  const progress = {
    current: stats.completed,
    total: stats.total,
    correct: stats.correct,
    incorrect: stats.incorrect,
    accuracy: stats.completed > 0
      ? (stats.correct / stats.completed) * 100
      : 0,
  };

  return {
    currentCard,
    queue,
    currentCardIndex,
    sessionStarted,
    stats,
    progress,
    isLoading: isLoadingQueue || isSubmitting,
    handleStartSession,
    handleEndSession,
    handleRating,
    reset,
  };
};


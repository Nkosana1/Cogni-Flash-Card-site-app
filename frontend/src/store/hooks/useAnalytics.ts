/**
 * Custom hook for analytics
 */
import { useDispatch, useSelector } from 'react-redux';
import {
  useGetOverviewQuery,
  useGetDeckStatsQuery,
  useGetStreakQuery,
} from '../api/analyticsApi';
import { setOverview, setDeckStats, setStreak } from '../slices/analyticsSlice';
import { RootState } from '../index';
import { useEffect } from 'react';

export const useAnalytics = (deckId?: number) => {
  const dispatch = useDispatch();
  const { overview, deckStats, streak } = useSelector(
    (state: RootState) => state.analytics
  );

  const { data: overviewData, isLoading: isLoadingOverview } = useGetOverviewQuery();
  const { data: deckStatsData, isLoading: isLoadingDeckStats } = useGetDeckStatsQuery(
    deckId!,
    { skip: !deckId }
  );
  const { data: streakData, isLoading: isLoadingStreak } = useGetStreakQuery();

  // Sync data with Redux state
  useEffect(() => {
    if (overviewData) {
      dispatch(setOverview(overviewData));
    }
  }, [overviewData, dispatch]);

  useEffect(() => {
    if (deckStatsData && deckId) {
      dispatch(setDeckStats({ deckId, stats: deckStatsData }));
    }
  }, [deckStatsData, deckId, dispatch]);

  useEffect(() => {
    if (streakData) {
      dispatch(
        setStreak({
          current: streakData.current_streak,
          longest: streakData.longest_streak,
          startDate: streakData.streak_start_date,
        })
      );
    }
  }, [streakData, dispatch]);

  return {
    overview: overview || overviewData,
    deckStats: deckId ? deckStats[deckId] || deckStatsData : null,
    streak,
    isLoading: isLoadingOverview || isLoadingDeckStats || isLoadingStreak,
  };
};


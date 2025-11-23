/**
 * RTK Query API for analytics
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AnalyticsOverview } from '@/types';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/analytics',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any).auth?.token || localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery,
  tagTypes: ['Analytics'],
  endpoints: (builder) => ({
    getOverview: builder.query<AnalyticsOverview, void>({
      query: () => '/overview',
      providesTags: ['Analytics'],
    }),
    getDeckStats: builder.query<any, number>({
      query: (deckId) => `/deck/${deckId}`,
      providesTags: (result, error, deckId) => [
        { type: 'Analytics', id: deckId },
      ],
    }),
    getStreak: builder.query<
      { current_streak: number; streak_start_date: string | null; longest_streak: number },
      void
    >({
      query: () => '/streak',
      providesTags: ['Analytics'],
    }),
  }),
});

export const {
  useGetOverviewQuery,
  useGetDeckStatsQuery,
  useGetStreakQuery,
} = analyticsApi;


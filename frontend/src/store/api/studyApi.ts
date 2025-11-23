/**
 * RTK Query API for study sessions
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { StudyQueue, StudySession as StudySessionType } from '@/types';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/study',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any).auth?.token || localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

interface SubmitReviewRequest {
  card_id: number;
  quality: number;
}

interface StartSessionRequest {
  deck_id: number;
}

export const studyApi = createApi({
  reducerPath: 'studyApi',
  baseQuery,
  tagTypes: ['StudyQueue', 'Review', 'Session'],
  endpoints: (builder) => ({
    getStudyQueue: builder.query<StudyQueue, number | undefined>({
      query: (deckId) => ({
        url: '/queue',
        params: deckId ? { deck_id: deckId } : {},
      }),
      providesTags: ['StudyQueue'],
    }),
    submitReview: builder.mutation<
      { message: string; review: any; previous_state: any },
      SubmitReviewRequest
    >({
      query: (body) => ({
        url: '/review',
        method: 'POST',
        body,
      }),
      // Optimistic update
      async onQueryStarted({ card_id, quality }, { dispatch, queryFulfilled }) {
        // Optimistically update the queue
        const patchResult = dispatch(
          studyApi.util.updateQueryData('getStudyQueue', undefined, (draft) => {
            // Remove the reviewed card from queue
            draft.queue = draft.queue.filter((card) => card.id !== card_id);
            draft.due_cards = draft.due_cards.filter((card) => card.id !== card_id);
            draft.total_cards = draft.queue.length;
            draft.due_count = draft.due_cards.length;
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert on error
          patchResult.undo();
        }
      },
      invalidatesTags: ['StudyQueue', 'Review'],
    }),
    getCurrentSession: builder.query<{ session: StudySessionType | null }, void>({
      query: () => '/session/current',
      providesTags: ['Session'],
    }),
    startSession: builder.mutation<{ message: string; session: StudySessionType }, StartSessionRequest>({
      query: (body) => ({
        url: '/session/start',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Session'],
    }),
    endSession: builder.mutation<{ message: string; session: StudySessionType }, void>({
      query: () => ({
        url: '/session/end',
        method: 'POST',
      }),
      invalidatesTags: ['Session'],
    }),
  }),
});

export const {
  useGetStudyQueueQuery,
  useSubmitReviewMutation,
  useGetCurrentSessionQuery,
  useStartSessionMutation,
  useEndSessionMutation,
} = studyApi;


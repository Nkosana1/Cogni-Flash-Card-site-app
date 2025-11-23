/**
 * RTK Query API for card operations
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Card } from '@/types';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any).auth?.token || localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

interface CreateCardRequest {
  front_content: string;
  back_content?: string;
  card_type?: string;
  media_attachments?: any[];
  card_data?: Record<string, any>;
}

interface UpdateCardRequest extends Partial<CreateCardRequest> {
  id: number;
}

interface BatchCreateRequest {
  deck_id: number;
  cards: Array<{
    front_content: string;
    back_content: string;
    card_type?: string;
  }>;
}

export const cardApi = createApi({
  reducerPath: 'cardApi',
  baseQuery,
  tagTypes: ['Card', 'Cards'],
  endpoints: (builder) => ({
    getDeckCards: builder.query<{ items: Card[]; pagination: any }, { deckId: number; page?: number; per_page?: number }>({
      query: ({ deckId, ...params }) => ({
        url: `/decks/${deckId}/cards`,
        params,
      }),
      providesTags: (result, error, { deckId }) => [
        { type: 'Cards', id: deckId },
      ],
    }),
    getCard: builder.query<Card, number>({
      query: (id) => `/cards/${id}`,
      providesTags: (result, error, id) => [{ type: 'Card', id }],
    }),
    createCard: builder.mutation<Card, { deckId: number; card: CreateCardRequest }>({
      query: ({ deckId, card }) => ({
        url: `/decks/${deckId}/cards`,
        method: 'POST',
        body: card,
      }),
      invalidatesTags: (result, error, { deckId }) => [
        { type: 'Cards', id: deckId },
      ],
    }),
    updateCard: builder.mutation<Card, UpdateCardRequest>({
      query: ({ id, ...card }) => ({
        url: `/cards/${id}`,
        method: 'PUT',
        body: card,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Card', id },
        'Cards',
      ],
    }),
    deleteCard: builder.mutation<void, number>({
      query: (id) => ({
        url: `/cards/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cards'],
    }),
    batchCreateCards: builder.mutation<{ message: string; cards: Card[] }, BatchCreateRequest>({
      query: (data) => ({
        url: '/cards/batch',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { deck_id }) => [
        { type: 'Cards', id: deck_id },
      ],
    }),
    getCardViews: builder.query<any, number>({
      query: (cardId) => `/cards/${cardId}/views`,
      providesTags: (result, error, cardId) => [{ type: 'Card', id: cardId }],
    }),
    createReverseCard: builder.mutation<Card, number>({
      query: (cardId) => ({
        url: `/cards/${cardId}/reverse`,
        method: 'POST',
      }),
      invalidatesTags: ['Cards'],
    }),
    generateMultipleChoice: builder.mutation<{ message: string; cards: Card[] }, { deckId: number; num_options?: number }>({
      query: ({ deckId, ...params }) => ({
        url: `/cards/decks/${deckId}/generate-multiple-choice`,
        method: 'POST',
        body: params,
      }),
      invalidatesTags: (result, error, { deckId }) => [
        { type: 'Cards', id: deckId },
      ],
    }),
  }),
});

export const {
  useGetDeckCardsQuery,
  useGetCardQuery,
  useCreateCardMutation,
  useUpdateCardMutation,
  useDeleteCardMutation,
  useBatchCreateCardsMutation,
  useGetCardViewsQuery,
  useCreateReverseCardMutation,
  useGenerateMultipleChoiceMutation,
} = cardApi;


/**
 * RTK Query API for deck management
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Deck } from '@/types';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/decks',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any).auth?.token || localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

interface CreateDeckRequest {
  title: string;
  description?: string;
  is_public?: boolean;
  tags?: string[];
  color?: string;
}

interface UpdateDeckRequest extends Partial<CreateDeckRequest> {
  id: number;
}

export const deckApi = createApi({
  reducerPath: 'deckApi',
  baseQuery,
  tagTypes: ['Deck', 'Decks'],
  endpoints: (builder) => ({
    getDecks: builder.query<{ items: Deck[]; pagination: any }, { page?: number; per_page?: number }>({
      query: (params = {}) => ({
        url: '',
        params,
      }),
      providesTags: ['Decks'],
    }),
    getDeck: builder.query<Deck, number>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Deck', id }],
    }),
    createDeck: builder.mutation<Deck, CreateDeckRequest>({
      query: (deck) => ({
        url: '',
        method: 'POST',
        body: deck,
      }),
      invalidatesTags: ['Decks'],
    }),
    updateDeck: builder.mutation<Deck, UpdateDeckRequest>({
      query: ({ id, ...deck }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: deck,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Deck', id },
        'Decks',
      ],
    }),
    deleteDeck: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Decks'],
    }),
    getPublicDecks: builder.query<{ items: Deck[]; pagination: any }, { page?: number; per_page?: number; search?: string; tags?: string }>({
      query: (params = {}) => ({
        url: '/public',
        params,
      }),
    }),
    cloneDeck: builder.mutation<Deck, number>({
      query: (id) => ({
        url: `/${id}/clone`,
        method: 'POST',
      }),
      invalidatesTags: ['Decks'],
    }),
  }),
});

export const {
  useGetDecksQuery,
  useGetDeckQuery,
  useCreateDeckMutation,
  useUpdateDeckMutation,
  useDeleteDeckMutation,
  useGetPublicDecksQuery,
  useCloneDeckMutation,
} = deckApi;


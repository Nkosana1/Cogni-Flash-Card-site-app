/**
 * Redux store configuration
 */
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import deckReducer from './slices/deckSlice';
import studyReducer from './slices/studySlice';
import uiReducer from './slices/uiSlice';
import analyticsReducer from './slices/analyticsSlice';

import { authApi } from './api/authApi';
import { deckApi } from './api/deckApi';
import { cardApi } from './api/cardApi';
import { studyApi } from './api/studyApi';
import { analyticsApi } from './api/analyticsApi';
import { errorHandlerMiddleware } from './utils/errorHandler';
import { offlineMiddleware } from './utils/offlineSupport';

// Persist configuration for auth
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'user', 'isAuthenticated'],
};

// Persist configuration for UI preferences
const uiPersistConfig = {
  key: 'ui',
  storage,
  whitelist: ['theme', 'viewMode'],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  decks: deckReducer,
  study: studyReducer,
  ui: persistReducer(uiPersistConfig, uiReducer),
  analytics: analyticsReducer,
  [authApi.reducerPath]: authApi.reducer,
  [deckApi.reducerPath]: deckApi.reducer,
  [cardApi.reducerPath]: cardApi.reducer,
  [studyApi.reducerPath]: studyApi.reducer,
  [analyticsApi.reducerPath]: analyticsApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(
      errorHandlerMiddleware,
      offlineMiddleware,
      authApi.middleware,
      deckApi.middleware,
      cardApi.middleware,
      studyApi.middleware,
      analyticsApi.middleware
    ),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


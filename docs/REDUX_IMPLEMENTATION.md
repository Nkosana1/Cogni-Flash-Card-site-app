# Redux Toolkit State Management Implementation

## ✅ Implementation Complete

Comprehensive Redux Toolkit state management with RTK Query, optimistic updates, error handling, and offline support.

## Store Structure

```
store/
├── slices/          # Redux slices
│   ├── authSlice.ts
│   ├── deckSlice.ts
│   ├── studySlice.ts
│   ├── uiSlice.ts
│   └── analyticsSlice.ts
├── api/             # RTK Query endpoints
│   ├── authApi.ts
│   ├── deckApi.ts
│   ├── cardApi.ts
│   ├── studyApi.ts
│   └── analyticsApi.ts
├── hooks/           # Custom hooks
│   ├── useAuth.ts
│   ├── useDecks.ts
│   ├── useStudy.ts
│   └── useAnalytics.ts
├── utils/           # Utilities
│   ├── offlineSupport.ts
│   └── errorHandler.ts
└── index.ts         # Store configuration
```

## Redux Slices

### 1. Auth Slice (`authSlice.ts`)
- **State**: user, token, isAuthenticated, loading, error
- **Actions**: loginStart, loginSuccess, loginFailure, logout, updateUser, clearError
- **Persistence**: Token and user data persisted to localStorage

### 2. Deck Slice (`deckSlice.ts`)
- **State**: decks, currentDeck, loading, error, viewMode, searchQuery, selectedTags
- **Actions**: setDecks, addDeck, updateDeck, removeDeck, setCurrentDeck, setViewMode, etc.
- **Features**: Search, filtering, view mode management

### 3. Study Slice (`studySlice.ts`)
- **State**: currentSession, queue, currentCardIndex, sessionStarted, stats
- **Actions**: setQueue, startSession, endSession, nextCard, submitReview, resetSession
- **Features**: Session tracking, progress stats, optimistic updates

### 4. UI Slice (`uiSlice.ts`)
- **State**: theme, sidebarOpen, modal, notifications, loading
- **Actions**: setTheme, toggleSidebar, openModal, closeModal, addNotification, etc.
- **Persistence**: Theme preference persisted

### 5. Analytics Slice (`analyticsSlice.ts`)
- **State**: overview, deckStats, streak, loading, error
- **Actions**: setOverview, setDeckStats, setStreak
- **Features**: Cached analytics data

## RTK Query APIs

### 1. Auth API (`authApi.ts`)
- `register` - User registration
- `login` - User login
- `logout` - User logout
- `getCurrentUser` - Get current user data
- **Tags**: `['User']`

### 2. Deck API (`deckApi.ts`)
- `getDecks` - List user decks (paginated)
- `getDeck` - Get deck details
- `createDeck` - Create new deck
- `updateDeck` - Update deck
- `deleteDeck` - Delete deck
- `getPublicDecks` - Browse public decks
- `cloneDeck` - Clone public deck
- **Tags**: `['Deck', 'Decks']`

### 3. Card API (`cardApi.ts`)
- `getDeckCards` - List deck cards
- `getCard` - Get card details
- `createCard` - Create card
- `updateCard` - Update card
- `deleteCard` - Delete card
- `batchCreateCards` - Bulk create cards
- `getCardViews` - Get card views (cloze/image occlusion)
- `createReverseCard` - Generate reverse card
- `generateMultipleChoice` - Generate MC cards
- **Tags**: `['Card', 'Cards']`

### 4. Study API (`studyApi.ts`)
- `getStudyQueue` - Get study queue
- `submitReview` - Submit card review (with optimistic update)
- `getCurrentSession` - Get current session
- `startSession` - Start study session
- `endSession` - End study session
- **Tags**: `['StudyQueue', 'Review', 'Session']`
- **Optimistic Updates**: Queue automatically updates on review submission

### 5. Analytics API (`analyticsApi.ts`)
- `getOverview` - Get study overview
- `getDeckStats` - Get deck-specific stats
- `getStreak` - Get streak data
- **Tags**: `['Analytics']`

## Custom Hooks

### useAuth()
```typescript
const {
  user,
  token,
  isAuthenticated,
  loading,
  error,
  login,
  register,
  logout,
  updateUser,
  refetchUser,
} = useAuth();
```

### useDecks()
```typescript
const {
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
} = useDecks();
```

### useStudySession(deckId?)
```typescript
const {
  currentCard,
  queue,
  currentCardIndex,
  sessionStarted,
  stats,
  progress,
  isLoading,
  handleStartSession,
  handleEndSession,
  handleRating,
  reset,
} = useStudySession(deckId);
```

### useAnalytics(deckId?)
```typescript
const {
  overview,
  deckStats,
  streak,
  isLoading,
} = useAnalytics(deckId);
```

## Features

### 1. Optimistic Updates ✅
- **Study Reviews**: Queue automatically updates when submitting reviews
- **RTK Query**: Built-in optimistic update support with rollback on error
- **Example**: `submitReview` in `studyApi.ts` uses `onQueryStarted` for optimistic updates

### 2. Error Handling ✅
- **Error Middleware**: Centralized error handling with `errorHandlerMiddleware`
- **Error Messages**: Extracts error messages from API responses
- **User Feedback**: Errors can trigger notifications (integrate with UI slice)

### 3. Offline Support ✅
- **Request Queueing**: Failed requests queued when offline
- **Auto Retry**: Queued requests processed when back online
- **Persistence**: Queue stored in localStorage
- **24-hour Window**: Only retries requests from last 24 hours

### 4. State Persistence ✅
- **redux-persist**: Auth and UI preferences persisted
- **localStorage**: Token and theme preferences saved
- **Rehydration**: State restored on app load

### 5. TypeScript Support ✅
- **Typed Hooks**: `useAppDispatch` and `useAppSelector`
- **Type Safety**: Full TypeScript support throughout
- **RootState**: Exported for type inference

## Usage Examples

### Authentication
```typescript
import { useAuth } from '@/store/hooks';

function LoginComponent() {
  const { login, loading, error } = useAuth();
  
  const handleLogin = async () => {
    const result = await login(username, password);
    if (result.success) {
      // Navigate to dashboard
    }
  };
}
```

### Study Session
```typescript
import { useStudySession } from '@/store/hooks';

function StudyPage() {
  const {
    currentCard,
    progress,
    handleRating,
    isLoading,
  } = useStudySession(deckId);
  
  return (
    <Flashcard
      card={currentCard}
      onRating={handleRating}
    />
  );
}
```

### Deck Management
```typescript
import { useDecks } from '@/store/hooks';

function DeckList() {
  const { decks, createDeck, deleteDeck } = useDecks();
  
  const handleCreate = async () => {
    const result = await createDeck({
      title: 'New Deck',
      description: 'Description',
    });
  };
}
```

## Store Configuration

### Middleware Stack
1. **Error Handler**: Catches and processes API errors
2. **Offline Support**: Queues requests when offline
3. **RTK Query APIs**: Auto-generated middleware for each API

### Persistence
- **Auth**: Token, user, isAuthenticated
- **UI**: Theme preference

### DevTools
- Enabled in development mode
- Redux DevTools extension support

## Integration

### App Setup
```typescript
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';

<Provider store={store}>
  <PersistGate loading={null} persistor={persistor}>
    <App />
  </PersistGate>
</Provider>
```

### Typed Hooks
```typescript
import { useAppDispatch, useAppSelector } from '@/hooks';

const dispatch = useAppDispatch();
const user = useAppSelector((state) => state.auth.user);
```

## Next Steps

1. **Connect Components**: Integrate hooks with React components
2. **Error Notifications**: Connect error handler to toast notifications
3. **Offline UI**: Add offline indicator component
4. **Cache Management**: Configure cache invalidation strategies
5. **Background Sync**: Implement background sync for offline actions

## Files Created

- `store/index.ts` - Store configuration
- `store/slices/*.ts` - 5 Redux slices
- `store/api/*.ts` - 5 RTK Query APIs
- `store/hooks/*.ts` - 4 custom hooks
- `store/utils/*.ts` - Error handler and offline support
- `hooks/useAppDispatch.ts` - Typed dispatch hook
- `hooks/useAppSelector.ts` - Typed selector hook

## Dependencies Added

- `@reduxjs/toolkit` - Redux Toolkit
- `react-redux` - React bindings
- `redux-persist` - State persistence


# Redux Toolkit Store

Complete state management solution for NeuroFlash using Redux Toolkit and RTK Query.

## Quick Start

```typescript
import { useAuth, useDecks, useStudySession } from '@/store/hooks';

// In your component
const { user, login, logout } = useAuth();
const { decks, createDeck } = useDecks();
const { currentCard, handleRating } = useStudySession();
```

## Structure

- **slices/**: Redux slices for local state
- **api/**: RTK Query API endpoints
- **hooks/**: Custom React hooks
- **utils/**: Utilities (error handling, offline support)

## Features

- ✅ Optimistic updates
- ✅ Error handling
- ✅ Offline support
- ✅ State persistence
- ✅ TypeScript support

See `docs/REDUX_IMPLEMENTATION.md` for full documentation.


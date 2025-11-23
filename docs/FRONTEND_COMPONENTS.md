# NeuroFlash Frontend Component Library

## Overview

Comprehensive React component library built with TypeScript, TailwindCSS, and accessibility in mind.

## Component Structure

```
src/components/
├── ui/              # Reusable UI components
├── cards/           # Flashcard components
├── study/           # Study session components
├── analytics/       # Charts and statistics
├── deck/            # Deck management
└── layout/          # Layout components
```

## UI Components

### Button
- Variants: primary, secondary, outline, ghost, danger
- Sizes: sm, md, lg
- Loading state
- Full width option
- Accessibility: ARIA labels, keyboard navigation

### Input
- Label and helper text support
- Error state with validation messages
- Full width option
- Accessibility: ARIA attributes

### Modal
- Portal-based rendering
- Keyboard navigation (Escape to close)
- Click outside to close
- Customizable size and footer
- Accessibility: ARIA modal attributes

### Loading
- Multiple sizes
- Full screen option
- Text support
- Accessibility: ARIA status

## Card Components

### Flashcard
- **3D flip animation** with CSS transforms
- **Keyboard shortcuts**: Space to flip, 1-5 for ratings
- **Touch gestures**: Swipe left/right to flip
- **Rich media support**: Images, audio, video
- **Markdown rendering**: With LaTeX support via KaTeX
- **Accessibility**: ARIA labels, keyboard navigation

### CardEditor
- Support for all 5 card types
- Dynamic editor based on card type
- Validation and error handling
- Save/cancel actions

### ClozeEditor
- Visual cloze syntax editor
- Real-time preview
- Insert cloze button
- Syntax: `{{c1::text::hint}}`

### ImageOcclusionEditor
- Image upload
- Region creation and editing
- Coordinate-based positioning
- Label and hint support

## Study Components

### StudySession
- Progress tracking
- Session timer
- Card counter
- Session summary modal
- Streak display
- Error boundary integration

### ProgressBar
- Visual progress indicator
- Percentage display
- Customizable label
- Accessibility: ARIA progressbar

### RatingButtons
- 5 quality ratings (0-4)
- Color-coded buttons
- Keyboard accessible
- Labels: Again, Hard, Good, Easy, Perfect

## Analytics Components

### ProgressChart
- Line chart for study progress
- Multiple metrics: reviewed, correct, accuracy
- Responsive design
- Recharts integration

### RetentionGraph
- Retention rate over time
- Average ease factor tracking
- Line chart visualization

### StudyCalendar
- Heat map calendar view
- Daily review counts
- Color intensity based on activity
- Current month view

## Layout Components

### DashboardLayout
- Navigation bar
- Sidebar
- Main content area
- Responsive design

### Navigation
- Logo and branding
- Main navigation links
- User menu
- Logout functionality

### Sidebar
- Flexible content area
- Responsive design
- Accessibility: ARIA complementary

## Deck Management

### DeckManager
- Grid/list view toggle
- Search functionality
- Tag filtering
- Bulk operations (select, delete)
- Import/export buttons
- Public deck indicators

## Features

### Accessibility
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Focus management
- Semantic HTML

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Touch-friendly interactions
- Adaptive layouts

### TypeScript
- Full type safety
- Interface definitions
- Type inference
- Strict mode enabled

### Testing
- Vitest for unit tests
- React Testing Library
- Component test examples
- Test setup configuration

### Storybook
- Component documentation
- Interactive examples
- Accessibility addon
- Visual testing

## Usage Examples

### Flashcard Component

```tsx
import { Flashcard } from '@/components/cards/Flashcard';
import { Card } from '@/types';

const card: Card = {
  id: 1,
  front_content: 'What is the capital of France?',
  back_content: 'Paris',
  card_type: 'basic',
  // ...
};

<Flashcard
  card={card}
  onRating={(quality) => console.log('Rated:', quality)}
  showRatingButtons={true}
/>
```

### Study Session

```tsx
import { StudySession } from '@/components/study/StudySession';

<StudySession
  cards={cards}
  onReview={async (cardId, quality) => {
    await submitReview(cardId, quality);
  }}
  onEndSession={() => navigate('/dashboard')}
  streak={7}
/>
```

### Deck Manager

```tsx
import { DeckManager } from '@/components/deck/DeckManager';

<DeckManager
  decks={decks}
  onDeckClick={(deck) => navigate(`/decks/${deck.id}`)}
  onDeckCreate={() => setShowCreateModal(true)}
  onDeckDelete={handleDelete}
  onDeckImport={handleImport}
  onDeckExport={handleExport}
/>
```

## Styling

All components use TailwindCSS utility classes:
- Consistent color scheme (primary, gray scales)
- Responsive utilities
- Custom animations (flip, fade-in)
- Dark mode ready (can be extended)

## Keyboard Shortcuts

### Flashcard
- `Space` or `Enter`: Flip card
- `1-5`: Rate card (1=Again, 5=Perfect)

### Modal
- `Escape`: Close modal

## Mobile Support

- Touch gestures for card flipping
- Responsive layouts
- Touch-friendly button sizes
- Swipe navigation

## Next Steps

1. **State Management**: Integrate Zustand store
2. **API Integration**: Connect to backend endpoints
3. **Routing**: Set up React Router
4. **Authentication**: Add auth context
5. **Error Handling**: Global error boundary
6. **Performance**: Code splitting, lazy loading

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Start Storybook
npm run storybook

# Build
npm run build
```


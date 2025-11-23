# NeuroFlash Frontend

React/TypeScript frontend for NeuroFlash spaced repetition flashcard platform.

## Features

- **5 Card Types**: Basic, Cloze, Image Occlusion, Reverse, Multiple Choice
- **Study Session**: Interactive study with progress tracking
- **Analytics**: Charts and statistics
- **Responsive Design**: Mobile-first with TailwindCSS
- **Accessibility**: ARIA labels, keyboard navigation
- **TypeScript**: Full type safety
- **Storybook**: Component documentation

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Start Storybook
npm run storybook

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── ui/          # Reusable UI components
│   ├── cards/       # Flashcard components
│   ├── study/       # Study session components
│   ├── analytics/   # Charts and stats
│   └── layout/      # Layout components
├── types/           # TypeScript definitions
└── utils/           # Utility functions
```

## Components

### UI Components
- Button
- Input
- Modal
- Loading

### Card Components
- Flashcard (with 3D flip animation)
- CardEditor
- ClozeEditor
- ImageOcclusionEditor

### Study Components
- StudySession
- CardReview
- ProgressBar
- RatingButtons

### Analytics Components
- ProgressChart
- RetentionGraph
- StudyCalendar

## Development

### Adding New Components

1. Create component in appropriate directory
2. Add TypeScript interfaces
3. Add Storybook stories
4. Add unit tests
5. Export from index.ts

### Styling

- Use TailwindCSS utility classes
- Follow responsive design patterns
- Ensure accessibility (ARIA labels, keyboard nav)

## Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui
```

## Storybook

```bash
# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

## License

MIT


# NeuroFlash Landing Page

High-converting landing page built with Next.js, featuring A/B testing, SEO optimization, and performance monitoring.

## Features

- 🎯 **Hero Section** - Typewriter effect with animated demo
- ✨ **Features Section** - Benefits with icons
- 📋 **How It Works** - Step-by-step visualization
- 📅 **Spaced Repetition Demo** - Interactive timeline
- 👥 **Social Proof** - Testimonials and metrics
- 💰 **Pricing** - Clear tiers with comparison
- ❓ **FAQ** - Expandable questions
- 🚀 **Final CTA** - Strong closing argument

## Technical Features

- **A/B Testing** - Built-in testing framework
- **SEO Optimized** - Meta tags, structured data, sitemap
- **Performance Monitoring** - Vercel Analytics & Speed Insights
- **Responsive Design** - Mobile-first approach
- **Animations** - Framer Motion for smooth interactions
- **TypeScript** - Full type safety

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## A/B Testing

Configure tests in `lib/ab-testing.ts`:

```typescript
const tests: ABTest[] = [
  {
    name: 'hero-cta',
    variants: ['Start Learning Free', 'Get Started Now'],
    defaultVariant: 'Start Learning Free',
  },
];
```

Use in components:

```typescript
import { getVariant } from '@/lib/ab-testing';

const ctaText = getVariant('hero-cta');
```

## SEO

- Meta tags in `_document.tsx`
- Structured data (JSON-LD)
- Semantic HTML
- Optimized images
- Sitemap generation

## Performance

- Vercel Analytics integration
- Speed Insights monitoring
- Image optimization
- Code splitting
- CSS optimization

## Deployment

Deploy to Vercel:

```bash
vercel
```

Or configure for other platforms in `next.config.js`.


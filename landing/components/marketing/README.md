# Marketing Components Library

Reusable marketing components for the NeuroFlash landing page.

## Components

### FeatureCard
Displays a feature with icon, title, and description. Includes scroll animations.

```tsx
<FeatureCard
  icon="🧠"
  title="Spaced Repetition"
  description="Scientifically-proven algorithm"
  animation="fade"
  delay={0.1}
/>
```

### TestimonialCard
Shows user testimonials with quote, name, role, and rating.

```tsx
<TestimonialCard
  quote="Amazing app!"
  name="John Doe"
  role="Student"
  rating={5}
  avatar="/avatar.jpg"
/>
```

### PricingCard
Displays pricing tier with features and CTA.

```tsx
<PricingCard
  name="Pro"
  price="$9"
  period="per month"
  features={['Feature 1', 'Feature 2']}
  cta="Get Started"
  popular={true}
/>
```

### StepCard
Shows a step in a process with number, title, and description.

```tsx
<StepCard
  number="01"
  title="Create Decks"
  description="Import or create your flashcards"
  icon="📚"
/>
```

### MetricCard
Displays a large metric with label and optional trend.

```tsx
<MetricCard
  number="1M+"
  label="Active Users"
  trend={{ value: "+20%", direction: "up" }}
/>
```

### FAQItem
Expandable FAQ item with question and answer.

```tsx
<FAQItem
  question="How does it work?"
  answer="It uses spaced repetition..."
  defaultOpen={false}
/>
```

### CTASection
Call-to-action section with headline, CTAs, and trust elements.

```tsx
<CTASection
  headline="Ready to get started?"
  primaryCta={{ text: "Sign Up Free" }}
  secondaryCta={{ text: "Learn More" }}
  trustElements={["No credit card", "Free forever"]}
/>
```

### SocialProof
Combines metrics and testimonials in one section.

```tsx
<SocialProof
  stats={[
    { number: "1M+", label: "Users" },
    { number: "4.8", label: "Rating" }
  ]}
  testimonials={[
    { quote: "...", name: "John", role: "Student" }
  ]}
/>
```

## Features

- ✅ Scroll-triggered animations
- ✅ Framer Motion integration
- ✅ TypeScript support
- ✅ Responsive design
- ✅ Accessibility (ARIA labels)
- ✅ Customizable styling

## Usage

Import components:

```tsx
import { FeatureCard, TestimonialCard } from '@/components/marketing';
```

Use in your pages:

```tsx
<FeatureCard
  icon="🎯"
  title="Feature Title"
  description="Feature description"
/>
```


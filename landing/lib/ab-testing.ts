/**
 * A/B Testing utility
 */
export interface ABTest {
  name: string;
  variants: string[];
  defaultVariant: string;
}

const tests: ABTest[] = [
  {
    name: 'hero-cta',
    variants: ['Start Learning Free', 'Get Started Now', 'Try It Free'],
    defaultVariant: 'Start Learning Free',
  },
  {
    name: 'pricing-highlight',
    variants: ['pro', 'free'],
    defaultVariant: 'pro',
  },
];

export function getVariant(testName: string): string {
  if (typeof window === 'undefined') {
    return tests.find((t) => t.name === testName)?.defaultVariant || '';
  }

  const stored = localStorage.getItem(`ab-test-${testName}`);
  if (stored) {
    return stored;
  }

  const test = tests.find((t) => t.name === testName);
  if (!test) {
    return '';
  }

  // Randomly assign variant
  const variant = test.variants[Math.floor(Math.random() * test.variants.length)];
  localStorage.setItem(`ab-test-${testName}`, variant);

  // Track assignment
  if ((window as any).gtag) {
    (window as any).gtag('event', 'ab_test_assignment', {
      test_name: testName,
      variant,
    });
  }

  return variant;
}

export function trackConversion(testName: string, conversionType: string) {
  if (typeof window === 'undefined') return;

  const variant = localStorage.getItem(`ab-test-${testName}`);
  if (variant && (window as any).gtag) {
    (window as any).gtag('event', 'conversion', {
      test_name: testName,
      variant,
      conversion_type: conversionType,
    });
  }
}


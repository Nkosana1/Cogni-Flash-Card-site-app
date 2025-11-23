import CTASection from '@/components/marketing/CTASection';

export default function FinalCTASection() {
  return (
    <CTASection
      headline="Ready to master anything?"
      subheadline="Join over 1 million learners using NeuroFlash to achieve their goals"
      primaryCta={{
        text: 'Start Learning Free',
        href: '/signup',
      }}
      secondaryCta={{
        text: 'See How It Works',
        onClick: () => {
          document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
        },
      }}
      background="gradient"
      trustElements={['No credit card required', 'Free forever', 'Cancel anytime']}
    />
  );
}


import { useState } from 'react';
import Head from 'next/head';
import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import SpacedRepetitionSection from '@/components/sections/SpacedRepetitionSection';
import SocialProofSection from '@/components/sections/SocialProofSection';
import PricingSection from '@/components/sections/PricingSection';
import FAQSection from '@/components/sections/FAQSection';
import FinalCTASection from '@/components/sections/FinalCTASection';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <>
      <Head>
        <title>NeuroFlash - Master Anything with Spaced Repetition</title>
        <meta
          name="description"
          content="Remember information 3x longer with NeuroFlash's scientifically-proven spaced repetition algorithm. Study smarter, not harder."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'NeuroFlash',
              applicationCategory: 'EducationalApplication',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                reviewCount: '1250',
              },
            }),
          }}
        />
      </Head>

      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <SpacedRepetitionSection />
        <SocialProofSection />
        <PricingSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <Footer />
    </>
  );
}


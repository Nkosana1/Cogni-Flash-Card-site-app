import SocialProof from '@/components/marketing/SocialProof';

const metrics = [
  { number: '1M+', label: 'Active Users' },
  { number: '50M+', label: 'Cards Created' },
  { number: '4.8/5', label: 'Average Rating' },
  { number: '95%', label: 'Retention Rate' },
];

const testimonials = [
  {
    quote: 'NeuroFlash helped me memorize thousands of medical terms. The spaced repetition algorithm is incredible!',
    name: 'Sarah Chen',
    role: 'Medical Student',
    rating: 5,
  },
  {
    quote: 'I\'ve tried many flashcard apps, but NeuroFlash\'s offline sync and multi-platform support is unmatched.',
    name: 'James Wilson',
    role: 'Language Learner',
    rating: 5,
  },
  {
    quote: 'My test scores improved dramatically after using NeuroFlash. The analytics helped me identify weak areas.',
    name: 'Emily Rodriguez',
    role: 'High School Student',
    rating: 5,
  },
];

export default function SocialProofSection() {
  return (
    <SocialProof
      stats={metrics}
      testimonials={testimonials}
      title="Loved by learners worldwide"
      subtitle="Join thousands of students achieving their learning goals"
    />
  );
}


import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import PricingCard from '@/components/marketing/PricingCard';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      'Unlimited cards',
      'Basic spaced repetition',
      'Web & mobile apps',
      'Community decks',
      'Basic analytics',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: 'per month',
    description: 'For serious learners',
    features: [
      'Everything in Free',
      'Advanced analytics',
      'Priority support',
      'Custom card templates',
      'Export to Anki',
      'Ad-free experience',
      'Early access to features',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Team',
    price: '$29',
    period: 'per month',
    description: 'For classrooms and teams',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Shared decks',
      'Progress tracking',
      'Admin dashboard',
      'Bulk import/export',
      'Custom branding',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function PricingSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-20 bg-white" ref={ref} id="pricing">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free, upgrade when you need more
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard
              key={plan.name}
              name={plan.name}
              price={plan.price}
              period={plan.period}
              description={plan.description}
              features={plan.features}
              cta={plan.cta}
              popular={plan.popular}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}


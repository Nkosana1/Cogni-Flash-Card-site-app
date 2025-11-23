import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import StepCard from '@/components/marketing/StepCard';

const steps = [
  {
    number: '01',
    title: 'Create or Import Decks',
    description: 'Create your own flashcards or import from thousands of community decks',
    icon: '📚',
  },
  {
    number: '02',
    title: 'Study with Spaced Repetition',
    description: 'Review cards at optimal intervals determined by our algorithm',
    icon: '🔄',
  },
  {
    number: '03',
    title: 'Rate Your Recall',
    description: 'Rate how well you remembered each card (1-4) to optimize future reviews',
    icon: '⭐',
  },
  {
    number: '04',
    title: 'Track Your Progress',
    description: 'Monitor your learning with detailed analytics and retention statistics',
    icon: '📈',
  },
];

export default function HowItWorksSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-20 bg-gradient-to-br from-primary-50 to-white" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started in minutes and see results in days
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-primary-200 -z-10" />
              )}
              <StepCard
                number={step.number}
                title={step.title}
                description={step.description}
                icon={step.icon}
                delay={index * 0.1}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


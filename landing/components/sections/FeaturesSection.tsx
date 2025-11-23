import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';

const features = [
  {
    icon: '🧠',
    title: 'Spaced Repetition Algorithm',
    description: 'Scientifically-proven SM-2 algorithm optimizes review timing for maximum retention',
  },
  {
    icon: '📱',
    title: 'Multi-Platform Sync',
    description: 'Study on web, iOS, and Android. Your progress syncs seamlessly across all devices',
  },
  {
    icon: '🎨',
    title: 'Rich Media Cards',
    description: 'Add images, audio, LaTeX math, and more. Create engaging, multimedia flashcards',
  },
  {
    icon: '📊',
    title: 'Progress Analytics',
    description: 'Track your learning with detailed analytics, streaks, and retention rates',
  },
  {
    icon: '👥',
    title: 'Community Decks',
    description: 'Browse and share decks with millions of learners worldwide',
  },
  {
    icon: '📴',
    title: 'Offline Study',
    description: 'Study anywhere, anytime. Full offline support with automatic sync when online',
  },
];

export default function FeaturesSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything you need to master any subject
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to make learning efficient, engaging, and effective
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

export default function FinalCTASection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-20 bg-gradient-to-br from-primary-600 to-blue-700 text-white" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Ready to master anything?
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Join over 1 million learners using NeuroFlash to achieve their goals
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              primary
              size="lg"
              className="bg-white text-primary-600 hover:bg-gray-100"
              onClick={() => {
                window.location.href = '/signup';
                if (typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'click', {
                    event_category: 'CTA',
                    event_label: 'Final CTA - Start Learning',
                  });
                }
              }}
            >
              Start Learning Free
            </Button>
            <Button
              secondary
              size="lg"
              className="border-white text-white hover:bg-white hover:text-primary-600"
              onClick={() => {
                document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              See How It Works
            </Button>
          </div>
          <p className="mt-8 text-sm opacity-75">
            No credit card required • Free forever • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}


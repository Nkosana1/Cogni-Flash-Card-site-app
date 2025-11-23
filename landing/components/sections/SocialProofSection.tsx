import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Medical Student',
    image: '👩‍⚕️',
    text: 'NeuroFlash helped me memorize thousands of medical terms. The spaced repetition algorithm is incredible!',
    rating: 5,
  },
  {
    name: 'James Wilson',
    role: 'Language Learner',
    image: '👨‍💼',
    text: 'I\'ve tried many flashcard apps, but NeuroFlash\'s offline sync and multi-platform support is unmatched.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'High School Student',
    image: '👩‍🎓',
    text: 'My test scores improved dramatically after using NeuroFlash. The analytics helped me identify weak areas.',
    rating: 5,
  },
];

const metrics = [
  { value: '1M+', label: 'Active Users' },
  { value: '50M+', label: 'Cards Created' },
  { value: '4.8/5', label: 'Average Rating' },
  { value: '95%', label: 'Retention Rate' },
];

export default function SocialProofSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-20 bg-gray-50" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
        >
          {metrics.map((metric) => (
            <div key={metric.label} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                {metric.value}
              </div>
              <div className="text-gray-600">{metric.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Loved by learners worldwide
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands of students achieving their learning goals
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <div className="text-4xl">{testimonial.image}</div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


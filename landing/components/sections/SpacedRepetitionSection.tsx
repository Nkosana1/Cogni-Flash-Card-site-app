import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';

const intervals = [
  { days: 1, label: '1 day', retention: 60 },
  { days: 2, label: '2 days', retention: 70 },
  { days: 6, label: '6 days', retention: 80 },
  { days: 15, label: '15 days', retention: 85 },
  { days: 30, label: '30 days', retention: 90 },
  { days: 90, label: '90 days', retention: 95 },
  { days: 180, label: '6 months', retention: 98 },
];

export default function SpacedRepetitionSection() {
  const [currentInterval, setCurrentInterval] = useState(0);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const current = intervals[currentInterval];

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
            The Science of Spaced Repetition
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Review cards at optimal intervals to maximize retention and minimize study time
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Timeline */}
          <div className="relative mb-12">
            <div className="flex justify-between items-center relative">
              {/* Progress line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10" />
              <div
                className="absolute top-1/2 left-0 h-1 bg-primary-600 -z-10 transition-all duration-500"
                style={{
                  width: `${(currentInterval / (intervals.length - 1)) * 100}%`,
                }}
              />

              {intervals.map((interval, index) => (
                <button
                  key={interval.days}
                  onClick={() => setCurrentInterval(index)}
                  className={`relative z-10 flex flex-col items-center group ${
                    index <= currentInterval ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                  disabled={index > currentInterval}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      index <= currentInterval
                        ? 'bg-primary-600 text-white scale-110 shadow-lg'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-sm font-semibold text-gray-900">
                      {interval.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {interval.retention}% retention
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <motion.div
            key={currentInterval}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-8 text-center"
          >
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Review after {current.label}
            </h3>
            <p className="text-lg text-gray-700 mb-4">
              At this interval, you'll retain approximately{' '}
              <span className="font-bold text-primary-600">{current.retention}%</span> of the
              information
            </p>
            <p className="text-gray-600">
              The algorithm automatically schedules your next review based on how well you
              remembered the card
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


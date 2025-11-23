import { useInView } from 'react-intersection-observer';
import MetricCard from './MetricCard';
import TestimonialCard from './TestimonialCard';

export interface SocialProofProps {
  stats: Array<{
    number: string;
    label: string;
    trend?: {
      value: string;
      direction: 'up' | 'down' | 'neutral';
    };
  }>;
  testimonials: Array<{
    quote: string;
    name: string;
    role: string;
    avatar?: string;
    rating?: number;
  }>;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function SocialProof({
  stats,
  testimonials,
  title = 'Loved by learners worldwide',
  subtitle = 'Join thousands of students achieving their learning goals',
  className = '',
}: SocialProofProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className={`py-20 bg-gray-50 ${className}`} ref={ref}>
      <div className="container mx-auto px-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <MetricCard
              key={stat.label}
              number={stat.number}
              label={stat.label}
              trend={stat.trend}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Title */}
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xl text-gray-600">{subtitle}</p>
            )}
          </div>
        )}

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              quote={testimonial.quote}
              name={testimonial.name}
              role={testimonial.role}
              avatar={testimonial.avatar}
              rating={testimonial.rating}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}


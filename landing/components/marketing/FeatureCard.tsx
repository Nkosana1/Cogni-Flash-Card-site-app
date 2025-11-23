import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export interface FeatureCardProps {
  icon: string | React.ReactNode;
  title: string;
  description: string;
  animation?: 'fade' | 'slide' | 'scale';
  delay?: number;
  className?: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
  animation = 'fade',
  delay = 0,
  className = '',
}: FeatureCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
      observer.disconnect();
    };
  }, []);

  const animationVariants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    },
    slide: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
    },
  };

  const variant = animationVariants[animation];

  return (
    <motion.div
      ref={ref}
      initial={variant.initial}
      animate={isVisible ? variant.animate : variant.initial}
      transition={{ duration: 0.6, delay }}
      className={`p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors ${className}`}
    >
      <div className="text-4xl mb-4">
        {typeof icon === 'string' ? (
          <span>{icon}</span>
        ) : (
          icon
        )}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}


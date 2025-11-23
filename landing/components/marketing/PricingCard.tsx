import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

export interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  delay?: number;
  onCtaClick?: () => void;
  className?: string;
}

export default function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  popular = false,
  delay = 0,
  onCtaClick,
  className = '',
}: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className={`relative rounded-2xl p-8 ${
        popular
          ? 'bg-primary-600 text-white shadow-2xl scale-105'
          : 'bg-gray-50 border-2 border-gray-200'
      } ${className}`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-5xl font-bold">{price}</span>
          <span className={`${popular ? 'text-white opacity-80' : 'text-gray-500'}`}>
            {period}
          </span>
        </div>
        <p className={`mt-2 text-sm ${popular ? 'opacity-80' : 'text-gray-600'}`}>
          {description}
        </p>
      </div>

      {/* Features */}
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <svg
              className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                popular ? 'text-white' : 'text-green-500'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className={popular ? 'text-white' : 'text-gray-700'}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        primary={popular}
        secondary={!popular}
        size="lg"
        className="w-full"
        onClick={onCtaClick || (() => (window.location.href = '/signup'))}
      >
        {cta}
      </Button>
    </motion.div>
  );
}


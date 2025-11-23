import { motion } from 'framer-motion';

export interface MetricCardProps {
  number: string;
  label: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  delay?: number;
  className?: string;
}

export default function MetricCard({
  number,
  label,
  trend,
  delay = 0,
  className = '',
}: MetricCardProps) {
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500',
  };

  const trendIcons = {
    up: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
          clipRule="evenodd"
        />
      </svg>
    ),
    down: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    ),
    neutral: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className={`text-center ${className}`}
    >
      <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
        {number}
      </div>
      <div className="text-gray-600 mb-2">{label}</div>
      {trend && (
        <div className={`flex items-center justify-center gap-1 text-sm ${trendColors[trend.direction]}`}>
          {trendIcons[trend.direction]}
          <span>{trend.value}</span>
        </div>
      )}
    </motion.div>
  );
}


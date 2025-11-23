import { motion } from 'framer-motion';

export interface StepCardProps {
  number: string;
  title: string;
  description: string;
  illustration?: React.ReactNode;
  icon?: string;
  delay?: number;
  className?: string;
}

export default function StepCard({
  number,
  title,
  description,
  illustration,
  icon,
  delay = 0,
  className = '',
}: StepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className={`relative text-center ${className}`}
    >
      {/* Illustration or Icon */}
      <div className="mb-4">
        {illustration ? (
          illustration
        ) : icon ? (
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-600 text-white text-2xl font-bold shadow-lg">
            {icon}
          </div>
        ) : (
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-600 text-white text-2xl font-bold shadow-lg">
            {number}
          </div>
        )}
      </div>

      {/* Number */}
      <div className="text-primary-600 text-sm font-semibold mb-2">{number}</div>

      {/* Content */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}


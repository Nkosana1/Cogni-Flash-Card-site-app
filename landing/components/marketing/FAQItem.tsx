import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FAQItemProps {
  question: string;
  answer: string;
  defaultOpen?: boolean;
  className?: string;
}

export default function FAQItem({
  question,
  answer,
  defaultOpen = false,
  className = '',
}: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
      <button
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-gray-900 pr-4">{question}</span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 text-gray-600">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


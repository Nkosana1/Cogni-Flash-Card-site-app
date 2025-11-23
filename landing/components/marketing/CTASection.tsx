import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

export interface CTASectionProps {
  headline: string;
  subheadline?: string;
  primaryCta: {
    text: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryCta?: {
    text: string;
    onClick?: () => void;
    href?: string;
  };
  background?: 'gradient' | 'solid' | 'image';
  backgroundColor?: string;
  trustElements?: string[];
  className?: string;
}

export default function CTASection({
  headline,
  subheadline,
  primaryCta,
  secondaryCta,
  background = 'gradient',
  backgroundColor,
  trustElements,
  className = '',
}: CTASectionProps) {
  const backgroundClasses = {
    gradient: 'bg-gradient-to-br from-primary-600 to-blue-700',
    solid: backgroundColor ? `bg-[${backgroundColor}]` : 'bg-primary-600',
    image: 'bg-cover bg-center',
  };

  const handlePrimaryClick = () => {
    if (primaryCta.onClick) {
      primaryCta.onClick();
    } else if (primaryCta.href) {
      window.location.href = primaryCta.href;
    } else {
      window.location.href = '/signup';
    }

    // Track conversion
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'click', {
        event_category: 'CTA',
        event_label: primaryCta.text,
      });
    }
  };

  const handleSecondaryClick = () => {
    if (secondaryCta?.onClick) {
      secondaryCta.onClick();
    } else if (secondaryCta?.href) {
      window.location.href = secondaryCta.href;
    }
  };

  return (
    <section
      className={`py-20 text-white ${backgroundClasses[background]} ${className}`}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {headline}
          </h2>
          {subheadline && (
            <p className="text-xl md:text-2xl mb-8 opacity-90">{subheadline}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              primary
              size="lg"
              className="bg-white text-primary-600 hover:bg-gray-100"
              onClick={handlePrimaryClick}
            >
              {primaryCta.text}
            </Button>
            {secondaryCta && (
              <Button
                secondary
                size="lg"
                className="border-white text-white hover:bg-white hover:text-primary-600"
                onClick={handleSecondaryClick}
              >
                {secondaryCta.text}
              </Button>
            )}
          </div>

          {trustElements && trustElements.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm opacity-75">
              {trustElements.map((element, index) => (
                <div key={index} className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{element}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}


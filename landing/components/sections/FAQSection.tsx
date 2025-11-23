import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import FAQItem from '@/components/marketing/FAQItem';

const faqs = [
  {
    question: 'How does spaced repetition work?',
    answer:
      'Spaced repetition is a learning technique that increases intervals of time between subsequent reviews of previously learned material. NeuroFlash uses the SM-2 algorithm to optimize these intervals based on how well you remember each card, maximizing retention while minimizing study time.',
  },
  {
    question: 'Is NeuroFlash really free?',
    answer:
      'Yes! Our free plan includes unlimited cards, basic spaced repetition, access to all platforms, and community decks. You can use NeuroFlash completely free forever. Pro features are optional and provide advanced analytics and premium support.',
  },
  {
    question: 'Can I use NeuroFlash offline?',
    answer:
      'Absolutely! NeuroFlash works completely offline on mobile apps. All your cards and progress sync automatically when you reconnect to the internet. This makes it perfect for studying on the go, even without internet access.',
  },
  {
    question: 'How do I import my existing flashcards?',
    answer:
      'You can import cards from CSV, JSON, or Anki format. Simply go to your deck settings, click "Import", and select your file. We support most common flashcard formats and will guide you through the process.',
  },
  {
    question: 'Can I share decks with others?',
    answer:
      'Yes! You can make any deck public and share it with a link. You can also browse thousands of community-created decks on various subjects. Pro users get additional collaboration features for teams.',
  },
  {
    question: 'What platforms does NeuroFlash support?',
    answer:
      'NeuroFlash is available on web (all browsers), iOS (iPhone and iPad), and Android. Your progress syncs seamlessly across all platforms, so you can study anywhere, anytime.',
  },
];

export default function FAQSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-20 bg-gray-50" ref={ref} id="faq">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about NeuroFlash
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <FAQItem
                question={faq.question}
                answer={faq.answer}
                defaultOpen={false}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


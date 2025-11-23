import { useState } from 'react';
import { motion } from 'framer-motion';

export default function InteractiveFlashcardDemo() {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="relative w-full max-w-md">
      <motion.div
        className="perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="relative w-full h-64 cursor-pointer">
          {/* Front */}
          <div
            className={`absolute inset-0 backface-hidden rounded-xl shadow-2xl p-8 flex items-center justify-center ${
              isFlipped ? 'hidden' : 'block'
            }`}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <div className="text-center text-white">
              <p className="text-2xl font-bold mb-4">What is the capital of France?</p>
              <p className="text-sm opacity-80">Tap to flip</p>
            </div>
          </div>

          {/* Back */}
          <div
            className={`absolute inset-0 backface-hidden rounded-xl shadow-2xl p-8 flex items-center justify-center rotate-y-180 ${
              !isFlipped ? 'hidden' : 'block'
            }`}
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="text-center text-white">
              <p className="text-3xl font-bold mb-4">Paris</p>
              <div className="flex gap-2 justify-center mt-6">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    className="w-12 h-12 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}


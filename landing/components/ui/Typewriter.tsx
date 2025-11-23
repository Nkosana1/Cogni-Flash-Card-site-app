import { useState, useEffect } from 'react';

interface TypewriterProps {
  phrases: string[];
  speed?: number;
  delay?: number;
}

export default function Typewriter({ phrases, speed = 100, delay = 2000 }: TypewriterProps) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayText.length < currentPhrase.length) {
      // Typing
      timeout = setTimeout(() => {
        setDisplayText(currentPhrase.slice(0, displayText.length + 1));
      }, speed);
    } else if (!isDeleting && displayText.length === currentPhrase.length) {
      // Pause before deleting
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, delay);
    } else if (isDeleting && displayText.length > 0) {
      // Deleting
      timeout = setTimeout(() => {
        setDisplayText(currentPhrase.slice(0, displayText.length - 1));
      }, speed / 2);
    } else if (isDeleting && displayText.length === 0) {
      // Move to next phrase
      setIsDeleting(false);
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentPhraseIndex, phrases, speed, delay]);

  return (
    <span className="inline-block min-w-[200px]">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}


import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Card } from '@/types';
import { cn } from '@/utils/cn';

export interface Flashcard3DProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
  className?: string;
}

export const Flashcard3D: React.FC<Flashcard3DProps> = ({
  card,
  isFlipped,
  onFlip,
  className,
}) => {
  const [imageZoom, setImageZoom] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const handleImageClick = (url: string) => {
    setZoomedImage(url);
    setImageZoom(true);
  };

  const renderContent = (content: string) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-code:text-primary-600 prose-pre:bg-gray-100"
        components={{
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="max-w-full h-auto rounded-lg cursor-zoom-in hover:opacity-90 transition-opacity"
              onClick={() => src && handleImageClick(src)}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  const renderMedia = () => {
    if (!card.media_attachments || card.media_attachments.length === 0) {
      return null;
    }

    return (
      <div className="mt-4 space-y-2">
        {card.media_attachments.map((media, index) => (
          <div key={index} className="rounded-lg overflow-hidden">
            {media.type === 'image' && (
              <img
                src={media.url}
                alt={`Card media ${index + 1}`}
                className="w-full h-auto max-h-64 object-contain cursor-zoom-in hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(media.url)}
              />
            )}
            {media.type === 'audio' && (
              <audio controls className="w-full">
                <source src={media.url} />
              </audio>
            )}
            {media.type === 'video' && (
              <video controls className="w-full max-h-64">
                <source src={media.url} />
              </video>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div
        className={cn(
          'relative w-full h-96 cursor-pointer perspective-1000',
          className
        )}
        onClick={onFlip}
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? 'Flip card to front' : 'Flip card to back'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onFlip();
          }
        }}
      >
        <div
          className={cn(
            'relative w-full h-full preserve-3d transition-transform duration-600',
            isFlipped && 'rotate-y-180'
          )}
        >
          {/* Front */}
          <div
            className={cn(
              'absolute inset-0 backface-hidden rounded-xl shadow-2xl p-8 bg-white border-2 border-gray-200 flex flex-col',
              isFlipped && 'hidden'
            )}
          >
            <div className="flex-1 flex items-center justify-center overflow-auto">
              <div className="text-center w-full">
                {renderContent(card.front_content)}
                {renderMedia()}
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-4 text-center">
              Click or press Space to flip
            </div>
          </div>

          {/* Back */}
          <div
            className={cn(
              'absolute inset-0 backface-hidden rotate-y-180 rounded-xl shadow-2xl p-8 bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200 flex flex-col',
              !isFlipped && 'hidden'
            )}
          >
            <div className="flex-1 flex items-center justify-center overflow-auto">
              <div className="text-center w-full">
                {renderContent(card.back_content)}
                {renderMedia()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {imageZoom && zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4"
          onClick={() => {
            setImageZoom(false);
            setZoomedImage(null);
          }}
        >
          <img
            src={zoomedImage}
            alt="Zoomed"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .duration-600 {
          transition-duration: 600ms;
        }
      `}</style>
    </>
  );
};


import React, { useState } from 'react';
import { Card, CardType } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ClozeEditor } from '../ClozeEditor';
import { ImageOcclusionEditor } from '../ImageOcclusionEditor';

export interface CardEditorProps {
  card?: Card;
  deckId: number;
  onSave: (cardData: Partial<Card>) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export const CardEditor: React.FC<CardEditorProps> = ({
  card,
  deckId,
  onSave,
  onCancel,
  className,
}) => {
  const [cardType, setCardType] = useState<CardType>(card?.card_type || 'basic');
  const [frontContent, setFrontContent] = useState(card?.front_content || '');
  const [backContent, setBackContent] = useState(card?.back_content || '');
  const [cardData, setCardData] = useState(card?.card_data || {});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);

    try {
      await onSave({
        deck_id: deckId,
        front_content: frontContent,
        back_content: backContent,
        card_type: cardType,
        card_data: cardData,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save card');
    } finally {
      setIsSaving(false);
    }
  };

  const renderEditor = () => {
    switch (cardType) {
      case 'cloze':
        return (
          <ClozeEditor
            value={frontContent}
            onChange={setFrontContent}
            onDataChange={setCardData}
          />
        );
      case 'image_occlusion':
        return (
          <ImageOcclusionEditor
            cardData={cardData}
            onDataChange={setCardData}
          />
        );
      default:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Front
              </label>
              <textarea
                value={frontContent}
                onChange={(e) => setFrontContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={4}
                placeholder="Enter front content..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Back
              </label>
              <textarea
                value={backContent}
                onChange={(e) => setBackContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={4}
                placeholder="Enter back content..."
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Type
          </label>
          <select
            value={cardType}
            onChange={(e) => setCardType(e.target.value as CardType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="basic">Basic</option>
            <option value="cloze">Cloze</option>
            <option value="image_occlusion">Image Occlusion</option>
            <option value="reverse">Reverse</option>
            <option value="multiple_choice">Multiple Choice</option>
          </select>
        </div>

        {renderEditor()}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            {card ? 'Update' : 'Create'} Card
          </Button>
        </div>
      </div>
    </div>
  );
};


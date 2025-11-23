import React, { useState, useMemo } from 'react';
import { Deck } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export interface DeckManagerProps {
  decks: Deck[];
  onDeckClick: (deck: Deck) => void;
  onDeckCreate: () => void;
  onDeckDelete: (deckId: number) => void;
  onDeckImport?: () => void;
  onDeckExport?: (deckId: number) => void;
  className?: string;
}

type ViewMode = 'grid' | 'list';

export const DeckManager: React.FC<DeckManagerProps> = ({
  decks,
  onDeckClick,
  onDeckCreate,
  onDeckDelete,
  onDeckImport,
  onDeckExport,
  className,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDecks, setSelectedDecks] = useState<Set<number>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    decks.forEach((deck) => {
      deck.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [decks]);

  // Filter decks
  const filteredDecks = useMemo(() => {
    return decks.filter((deck) => {
      const matchesSearch =
        searchQuery === '' ||
        deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => deck.tags?.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [decks, searchQuery, selectedTags]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleDeckSelect = (deckId: number) => {
    setSelectedDecks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(deckId)) {
        newSet.delete(deckId);
      } else {
        newSet.add(deckId);
      }
      return newSet;
    });
  };

  const handleBulkDelete = () => {
    selectedDecks.forEach((deckId) => {
      onDeckDelete(deckId);
    });
    setSelectedDecks(new Set());
    setShowDeleteModal(false);
  };

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Input
            type="text"
            placeholder="Search decks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 max-w-md"
          />
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              List
            </Button>
            <Button variant="outline" size="sm" onClick={onDeckCreate}>
              Create Deck
            </Button>
            {onDeckImport && (
              <Button variant="outline" size="sm" onClick={onDeckImport}>
                Import
              </Button>
            )}
            {selectedDecks.size > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete ({selectedDecks.size})
              </Button>
            )}
          </div>
        </div>

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Decks */}
      {filteredDecks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No decks found</p>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-2'
          }
        >
          {filteredDecks.map((deck) => (
            <div
              key={deck.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedDecks.has(deck.id)
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-white'
              }`}
              onClick={() => onDeckClick(deck)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{deck.title}</h3>
                  {deck.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {deck.description}
                    </p>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={selectedDecks.has(deck.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleDeckSelect(deck.id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="ml-2"
                  aria-label={`Select ${deck.title}`}
                />
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{deck.card_count} cards</span>
                  {deck.is_public && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                      Public
                    </span>
                  )}
                </div>
                {onDeckExport && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeckExport(deck.id);
                    }}
                  >
                    Export
                  </Button>
                )}
              </div>
              {deck.tags && deck.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {deck.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Decks"
      >
        <p className="mb-4">
          Are you sure you want to delete {selectedDecks.size} deck(s)? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleBulkDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};


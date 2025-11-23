import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DeckManager } from '@/components/deck/DeckManager';
import { useDecks } from '@/store/hooks';
import { useNavigate } from 'react-router-dom';

export default function DecksPage() {
  const navigate = useNavigate();
  const { decks, createDeck, deleteDeck } = useDecks();

  const handleDeckClick = (deck: any) => {
    navigate(`/decks/${deck.id}`);
  };

  const handleDeckCreate = () => {
    // TODO: Open create deck modal
    console.log('Create deck');
  };

  const handleDeckDelete = async (deckId: number) => {
    await deleteDeck(deckId);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Decks</h1>
        <DeckManager
          decks={decks}
          onDeckClick={handleDeckClick}
          onDeckCreate={handleDeckCreate}
          onDeckDelete={handleDeckDelete}
        />
      </div>
    </DashboardLayout>
  );
}


import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Flashcard } from './Flashcard';
import { Card } from '@/types';

const mockCard: Card = {
  id: 1,
  deck_id: 1,
  front_content: 'What is the capital of France?',
  back_content: 'Paris',
  card_type: 'basic',
  media_attachments: [],
  review_count: 0,
  created_at: '2024-01-01T00:00:00',
};

describe('Flashcard', () => {
  it('renders front content', () => {
    render(<Flashcard card={mockCard} />);
    expect(screen.getByText('What is the capital of France?')).toBeInTheDocument();
  });

  it('flips card on click', () => {
    render(<Flashcard card={mockCard} />);
    const cardElement = screen.getByRole('button');
    fireEvent.click(cardElement);
    expect(screen.getByText('Paris')).toBeInTheDocument();
  });

  it('calls onRating when rating button is clicked', () => {
    const onRating = vi.fn();
    render(<Flashcard card={mockCard} onRating={onRating} />);
    
    // Flip card first
    const cardElement = screen.getByRole('button');
    fireEvent.click(cardElement);
    
    // Click rating button
    const ratingButton = screen.getByLabelText('Rate 4 out of 5');
    fireEvent.click(ratingButton);
    
    expect(onRating).toHaveBeenCalledWith(3);
  });

  it('handles keyboard shortcuts', () => {
    const onFlip = vi.fn();
    render(<Flashcard card={mockCard} onFlip={onFlip} />);
    
    fireEvent.keyDown(window, { key: ' ' });
    expect(onFlip).toHaveBeenCalled();
  });
});


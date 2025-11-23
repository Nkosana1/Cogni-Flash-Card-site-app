import type { Meta, StoryObj } from '@storybook/react';
import { Flashcard } from './Flashcard';
import { Card } from '@/types';

const meta: Meta<typeof Flashcard> = {
  title: 'Cards/Flashcard',
  component: Flashcard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Flashcard>;

const basicCard: Card = {
  id: 1,
  deck_id: 1,
  front_content: 'What is the capital of France?',
  back_content: 'Paris',
  card_type: 'basic',
  media_attachments: [],
  review_count: 0,
  created_at: '2024-01-01T00:00:00',
};

const clozeCard: Card = {
  id: 2,
  deck_id: 1,
  front_content: 'The {{c1::capital}} of France is {{c2::Paris}}.',
  back_content: 'The capital of France is Paris.',
  card_type: 'cloze',
  media_attachments: [],
  review_count: 0,
  created_at: '2024-01-01T00:00:00',
};

export const Basic: Story = {
  args: {
    card: basicCard,
    onRating: (quality) => console.log('Rated:', quality),
  },
};

export const Cloze: Story = {
  args: {
    card: clozeCard,
    onRating: (quality) => console.log('Rated:', quality),
  },
};

export const WithImage: Story = {
  args: {
    card: {
      ...basicCard,
      media_attachments: [
        {
          url: 'https://via.placeholder.com/400x300',
          type: 'image',
        },
      ],
    },
    onRating: (quality) => console.log('Rated:', quality),
  },
};


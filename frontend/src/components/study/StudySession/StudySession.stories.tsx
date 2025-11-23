import type { Meta, StoryObj } from '@storybook/react';
import { StudySession } from './StudySession';
import { Card } from '@/types';

const meta: Meta<typeof StudySession> = {
  title: 'Study/StudySession',
  component: StudySession,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StudySession>;

const mockCards: Card[] = [
  {
    id: 1,
    deck_id: 1,
    front_content: 'What is the capital of France?',
    back_content: 'Paris',
    card_type: 'basic',
    media_attachments: [],
    review_count: 0,
    created_at: '2024-01-01T00:00:00',
  },
  {
    id: 2,
    deck_id: 1,
    front_content: 'What is 2 + 2?',
    back_content: '4',
    card_type: 'basic',
    media_attachments: [],
    review_count: 0,
    created_at: '2024-01-01T00:00:00',
  },
];

export const Default: Story = {
  args: {
    cards: mockCards,
    onReview: async (cardId, quality) => {
      console.log('Review:', cardId, quality);
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
    onEndSession: () => console.log('Session ended'),
    streak: 7,
  },
};


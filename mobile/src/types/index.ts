/**
 * Type definitions for NeuroFlash mobile app
 */

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  last_login?: string;
  settings: Record<string, any>;
}

export interface Deck {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  is_public: boolean;
  tags: string[];
  card_count: number;
  created_at: string;
}

export type CardType = 'basic' | 'cloze' | 'image_occlusion' | 'reverse' | 'multiple_choice';

export interface Card {
  id: number;
  deck_id: number;
  front_content: string;
  back_content: string;
  card_type: CardType;
  media_attachments: MediaAttachment[];
  card_data?: Record<string, any>;
  review_count: number;
  created_at: string;
}

export interface MediaAttachment {
  url: string;
  type: 'image' | 'audio' | 'video';
  added_at?: string;
}

export interface CardReview {
  id: number;
  card_id: number;
  user_id: number;
  quality: number;
  reviewed_at: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review?: string;
}

export interface StudySession {
  id: number;
  user_id: number;
  deck_id: number;
  start_time: string;
  end_time?: string;
  cards_studied: number;
  correct_count: number;
  accuracy: number;
  duration_seconds?: number;
  is_active: boolean;
}

export interface StudyQueue {
  due_cards: Card[];
  new_cards: Card[];
  total_cards: number;
  due_count: number;
  new_count: number;
  queue: Card[];
}

export interface AnalyticsOverview {
  total_cards: number;
  due_cards: number;
  new_cards: number;
  reviewed_today: number;
  sessions_today: number;
  study_time_today_minutes: number;
  average_accuracy_today: number;
  streak_days: number;
}

export interface OfflineAction {
  id: string;
  type: 'review' | 'create_card' | 'update_card' | 'delete_card';
  payload: any;
  timestamp: number;
  retries: number;
}


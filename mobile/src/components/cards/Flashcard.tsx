/**
 * Flashcard component for mobile
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/types';

export interface FlashcardProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ card, isFlipped, onFlip }) => {
  return (
    <TouchableOpacity
      style={[styles.card, isFlipped && styles.cardFlipped]}
      onPress={onFlip}
      activeOpacity={0.9}
    >
      <View style={styles.content}>
        <Text style={styles.text}>
          {isFlipped ? card.back_content : card.front_content}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  cardFlipped: {
    backgroundColor: '#e3f2fd',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
    color: '#333',
  },
});


/**
 * Deck detail screen
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { apiService } from '@/services/api';
import { Card } from '@/types';

export default function DeckDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { deckId } = route.params as { deckId: number };
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCards();
  }, [deckId]);

  const loadCards = async () => {
    try {
      const data = await apiService.getDeckCards(deckId);
      setCards(data.items || []);
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartStudy = () => {
    navigation.navigate('Study' as never, { deckId } as never);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.cardCount}>{cards.length} cards</Text>
      <TouchableOpacity style={styles.studyButton} onPress={handleStartStudy}>
        <Text style={styles.studyButtonText}>Start Studying</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardCount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  studyButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  studyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


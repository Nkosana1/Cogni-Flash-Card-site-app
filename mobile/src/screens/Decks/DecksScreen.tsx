/**
 * Deck browser screen
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState, AppDispatch } from '@/store';
import { setDecks, setLoading } from '@/store/slices/deckSlice';
import { apiService } from '@/services/api';
import { Deck } from '@/types';
import { Ionicons } from '@expo/vector-icons';

export default function DecksScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { decks, loading } = useSelector((state: RootState) => state.decks);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    try {
      dispatch(setLoading(true));
      const data = await apiService.getDecks();
      dispatch(setDecks(data.items || []));
    } catch (error) {
      console.error('Error loading decks:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const filteredDecks = decks.filter((deck) =>
    deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deck.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderDeck = ({ item }: { item: Deck }) => (
    <TouchableOpacity
      style={styles.deckCard}
      onPress={() => navigation.navigate('DeckDetail' as never, { deckId: item.id } as never)}
    >
      <View style={styles.deckHeader}>
        <Text style={styles.deckTitle}>{item.title}</Text>
        {item.is_public && (
          <Ionicons name="globe-outline" size={16} color="#3b82f6" />
        )}
      </View>
      {item.description && (
        <Text style={styles.deckDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      <View style={styles.deckFooter}>
        <Text style={styles.cardCount}>{item.card_count} cards</Text>
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tags}>
            {item.tags.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search decks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          style={styles.viewToggle}
        >
          <Ionicons
            name={viewMode === 'grid' ? 'list' : 'grid'}
            size={24}
            color="#3b82f6"
          />
        </TouchableOpacity>
      </View>

      {/* Decks List */}
      <FlatList
        data={filteredDecks}
        renderItem={renderDeck}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No decks found</Text>
          </View>
        }
        refreshing={loading}
        onRefresh={loadDecks}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  viewToggle: {
    marginLeft: 8,
    padding: 4,
  },
  listContent: {
    padding: 16,
  },
  deckCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deckTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  deckDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  deckFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCount: {
    fontSize: 14,
    color: '#999',
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#1976d2',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});


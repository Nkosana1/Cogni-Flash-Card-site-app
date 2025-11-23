/**
 * Study screen with swipe gestures
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setQueue, submitReview, nextCard, resetSession } from '@/store/slices/studySlice';
import { apiService } from '@/services/api';
import { Flashcard } from '@/components/cards/Flashcard';
import { RatingButtons } from '@/components/study/RatingButtons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

export default function StudyScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { queue, currentCardIndex, stats, sessionStarted } = useSelector(
    (state: RootState) => state.study
  );
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentCard = queue[currentCardIndex];
  const position = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    loadStudyQueue();
  }, []);

  const loadStudyQueue = async () => {
    try {
      setLoading(true);
      const data = await apiService.getStudyQueue();
      dispatch(setQueue(data.queue || []));
    } catch (error) {
      console.error('Error loading study queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) > SWIPE_THRESHOLD) {
          // Swipe left (next) or right (previous)
          if (gesture.dx > 0) {
            // Swipe right - go to previous (if available)
          } else {
            // Swipe left - flip card or go to next
            if (!isFlipped) {
              setIsFlipped(true);
            }
          }
        }
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const handleRating = async (quality: number) => {
    if (!currentCard) return;

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await apiService.submitReview(currentCard.id, quality);
      dispatch(submitReview({ quality }));

      if (currentCardIndex < queue.length - 1) {
        dispatch(nextCard());
        setIsFlipped(false);
      } else {
        // Session complete
        dispatch(resetSession());
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const handleFlip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsFlipped(!isFlipped);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading cards...</Text>
      </View>
    );
  }

  if (!currentCard) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No cards to study</Text>
        <Text style={styles.emptySubtext}>All caught up! 🎉</Text>
      </View>
    );
  }

  const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {stats.completed} / {stats.total}
        </Text>
      </View>

      {/* Flashcard */}
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Flashcard
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={handleFlip}
        />
      </Animated.View>

      {/* Rating Buttons */}
      {isFlipped && (
        <View style={styles.ratingContainer}>
          <RatingButtons onRating={handleRating} />
        </View>
      )}

      {/* Flip Hint */}
      {!isFlipped && (
        <Text style={styles.hintText}>Tap to flip</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  progressText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingContainer: {
    marginTop: 20,
  },
  hintText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 10,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});


/**
 * Rating buttons component for mobile
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface RatingButtonsProps {
  onRating: (quality: number) => void;
  disabled?: boolean;
}

const ratingLabels = ['Again', 'Hard', 'Good', 'Easy'];
const ratingColors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

export const RatingButtons: React.FC<RatingButtonsProps> = ({
  onRating,
  disabled = false,
}) => {
  const handleRating = (quality: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRating(quality);
  };

  return (
    <View style={styles.container}>
      {[0, 1, 2, 3].map((quality) => (
        <TouchableOpacity
          key={quality}
          style={[styles.button, { backgroundColor: ratingColors[quality] }]}
          onPress={() => handleRating(quality)}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonNumber}>{quality + 1}</Text>
          <Text style={styles.buttonLabel}>{ratingLabels[quality]}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  buttonNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  buttonLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
});


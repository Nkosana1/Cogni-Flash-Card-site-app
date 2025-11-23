/**
 * Sync progress indicator component
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { syncService, SyncProgress } from '@/services/SyncService';
import { Ionicons } from '@expo/vector-icons';

export const SyncIndicator: React.FC = () => {
  const [progress, setProgress] = useState<SyncProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    isSyncing: false,
  });
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const unsubscribe = syncService.onProgress((newProgress) => {
      setProgress(newProgress);
      
      // Fade in/out animation
      Animated.timing(fadeAnim, {
        toValue: newProgress.isSyncing ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    return unsubscribe;
  }, []);

  if (!progress.isSyncing && progress.total === 0) {
    return null;
  }

  const percentage =
    progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.content}>
        <ActivityIndicator size="small" color="#3b82f6" />
        <Text style={styles.text}>
          Syncing {progress.completed}/{progress.total}
        </Text>
        {progress.failed > 0 && (
          <Ionicons name="warning" size={16} color="#ef4444" />
        )}
      </View>
      {progress.total > 0 && (
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${percentage}%` }]}
          />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  progressBar: {
    height: 2,
    backgroundColor: '#e0e0e0',
    borderRadius: 1,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
});


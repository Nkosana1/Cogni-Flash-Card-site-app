/**
 * Sync status component with error handling
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { syncService } from '@/services/SyncService';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';

export const SyncStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Network status
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    // Pending changes count
    const updatePendingCount = async () => {
      const count = await syncService.getPendingCount();
      setPendingCount(count);
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);

    return () => {
      unsubscribeNetInfo();
      clearInterval(interval);
    };
  }, []);

  const handleSyncNow = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Please connect to the internet to sync');
      return;
    }

    try {
      await syncService.syncPendingChanges();
      const count = await syncService.getPendingCount();
      setPendingCount(count);
      
      if (count === 0) {
        Alert.alert('Success', 'All changes synced successfully');
      }
    } catch (error: any) {
      Alert.alert('Sync Error', error.message || 'Failed to sync changes');
    }
  };

  if (pendingCount === 0 && isOnline) {
    return null;
  }

  return (
    <View style={styles.container}>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline" size={16} color="#ef4444" />
          <Text style={styles.offlineText}>Offline Mode</Text>
        </View>
      )}

      {pendingCount > 0 && (
        <TouchableOpacity
          style={styles.syncButton}
          onPress={handleSyncNow}
          disabled={!isOnline}
        >
          <Ionicons
            name="sync"
            size={16}
            color={isOnline ? '#3b82f6' : '#999'}
          />
          <Text style={[styles.syncText, !isOnline && styles.syncTextDisabled]}>
            {pendingCount} pending {pendingCount === 1 ? 'change' : 'changes'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  offlineText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncText: {
    fontSize: 12,
    color: '#3b82f6',
  },
  syncTextDisabled: {
    color: '#999',
  },
});


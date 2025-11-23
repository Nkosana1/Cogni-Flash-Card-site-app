/**
 * Background sync service with battery optimization
 */
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { syncService } from './SyncService';
import { notificationService } from './NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SYNC_TASK = 'background-sync';

TaskManager.defineTask(SYNC_TASK, async () => {
  try {
    // Sync pending changes
    await syncService.syncPendingChanges();
    
    // Update notifications if needed
    await notificationService.scheduleDueCardNotifications();
    
    // Sync study data (less frequently)
    const lastSync = await AsyncStorage.getItem('lastSync');
    const now = Date.now();
    const syncInterval = Platform.OS === 'ios' ? 3600000 : 1800000; // 1 hour iOS, 30 min Android
    
    if (!lastSync || now - parseInt(lastSync) > syncInterval) {
      // Fetch latest data
      try {
        await syncService.getStudyData(undefined, true);
        await AsyncStorage.setItem('lastSync', now.toString());
      } catch (error) {
        // Silently fail if offline
        console.log('Background sync: offline or error');
      }
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background sync error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundSync() {
  try {
    // Battery-efficient intervals based on platform
    const minimumInterval = Platform.OS === 'ios' ? 15 * 60 : 15 * 60; // 15 minutes
    
    await BackgroundFetch.registerTaskAsync(SYNC_TASK, {
      minimumInterval,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (error) {
    console.error('Error registering background sync:', error);
  }
}

export async function unregisterBackgroundSync() {
  try {
    await BackgroundFetch.unregisterTaskAsync(SYNC_TASK);
  } catch (error) {
    console.error('Error unregistering background sync:', error);
  }
}


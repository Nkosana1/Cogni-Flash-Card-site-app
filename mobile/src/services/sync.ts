/**
 * Background sync service
 */
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { apiService } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SYNC_TASK = 'background-sync';

TaskManager.defineTask(SYNC_TASK, async () => {
  try {
    // Process offline queue
    await apiService.processOfflineQueue();
    
    // Sync study data
    const lastSync = await AsyncStorage.getItem('lastSync');
    const now = Date.now();
    
    // Only sync if last sync was more than 1 hour ago
    if (!lastSync || now - parseInt(lastSync) > 3600000) {
      // Fetch latest data
      await apiService.getDecks();
      await AsyncStorage.setItem('lastSync', now.toString());
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background sync error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundSync() {
  try {
    await BackgroundFetch.registerTaskAsync(SYNC_TASK, {
      minimumInterval: 15 * 60, // 15 minutes
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


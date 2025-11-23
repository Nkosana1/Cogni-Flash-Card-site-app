/**
 * Comprehensive offline synchronization service
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { apiService } from './api';
import { OfflineAction } from '@/types';

interface PendingChange {
  id: string;
  action: string;
  data: any;
  timestamp: number;
  retries: number;
  lastRetry?: number;
  priority: 'high' | 'medium' | 'low';
}

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  isSyncing: boolean;
}

export class SyncService {
  private queue: PendingChange[] = [];
  private isOnline: boolean = true;
  private syncInterval: NodeJS.Timeout | null = null;
  private syncInProgress: boolean = false;
  private progressCallbacks: ((progress: SyncProgress) => void)[] = [];
  private maxRetries: number = 5;
  private baseRetryDelay: number = 1000; // 1 second
  private syncIntervalMs: number = 30000; // 30 seconds

  async initialize() {
    // Load pending changes from storage
    await this.loadPendingChanges();

    // Setup network detection
    this.setupNetworkListener();

    // Start sync interval
    this.startSyncInterval();

    // Attempt immediate sync if online
    if (this.isOnline) {
      this.syncPendingChanges();
    }
  }

  private setupNetworkListener() {
    NetInfo.addEventListener((state) => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (wasOffline && this.isOnline) {
        // Just came back online, sync immediately
        this.syncPendingChanges();
      }
    });

    // Check initial state
    NetInfo.fetch().then((state) => {
      this.isOnline = state.isConnected ?? false;
    });
  }

  private startSyncInterval() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncPendingChanges();
      }
    }, this.syncIntervalMs);
  }

  async queueChange(
    action: string,
    data: any,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<string> {
    const change: PendingChange = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      data,
      timestamp: Date.now(),
      retries: 0,
      priority,
    };

    this.queue.push(change);
    await this.savePendingChanges();

    // Attempt immediate sync if online
    if (this.isOnline && priority === 'high') {
      this.syncPendingChanges();
    }

    return change.id;
  }

  async syncPendingChanges(): Promise<void> {
    if (!this.isOnline || this.syncInProgress || this.queue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    const pending = [...this.queue].sort((a, b) => {
      // Sort by priority, then by timestamp
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.timestamp - b.timestamp;
    });

    let completed = 0;
    let failed = 0;

    this.notifyProgress({
      total: pending.length,
      completed: 0,
      failed: 0,
      isSyncing: true,
    });

    for (const change of pending) {
      try {
        // Check if retry delay is needed
        if (change.lastRetry) {
          const delay = this.calculateRetryDelay(change.retries);
          const timeSinceLastRetry = Date.now() - change.lastRetry;
          if (timeSinceLastRetry < delay) {
            // Skip for now, will retry later
            continue;
          }
        }

        await this.executeChange(change);
        await this.removeFromQueue(change.id);
        completed++;
      } catch (error: any) {
        console.error('Sync failed for change:', change.id, error);

        // Increment retries
        change.retries++;
        change.lastRetry = Date.now();

        if (change.retries >= this.maxRetries) {
          // Max retries reached, remove from queue
          console.warn('Max retries reached for change:', change.id);
          await this.removeFromQueue(change.id);
          failed++;
        } else {
          // Keep in queue for retry
          await this.savePendingChanges();
          failed++;
        }
      }

      this.notifyProgress({
        total: pending.length,
        completed,
        failed,
        isSyncing: true,
      });
    }

    this.syncInProgress = false;
    this.notifyProgress({
      total: pending.length,
      completed,
      failed,
      isSyncing: false,
    });
  }

  private async executeChange(change: PendingChange): Promise<void> {
    switch (change.action) {
      case 'review':
        await apiService.submitReview(change.data.card_id, change.data.quality);
        break;
      case 'create_card':
        await apiService.createCard(change.data.deck_id, change.data);
        break;
      case 'update_card':
        await apiService.client.put(`/cards/${change.data.id}`, change.data);
        break;
      case 'delete_card':
        await apiService.client.delete(`/cards/${change.data.id}`);
        break;
      case 'create_deck':
        await apiService.createDeck(change.data);
        break;
      case 'update_deck':
        await apiService.client.put(`/decks/${change.data.id}`, change.data);
        break;
      default:
        throw new Error(`Unknown action: ${change.action}`);
    }
  }

  private calculateRetryDelay(retries: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    return this.baseRetryDelay * Math.pow(2, retries);
  }

  async getPendingChanges(): Promise<PendingChange[]> {
    return [...this.queue];
  }

  async getPendingCount(): Promise<number> {
    return this.queue.length;
  }

  async removeFromQueue(id: string): Promise<void> {
    this.queue = this.queue.filter((change) => change.id !== id);
    await this.savePendingChanges();
  }

  async clearQueue(): Promise<void> {
    this.queue = [];
    await this.savePendingChanges();
  }

  private async loadPendingChanges(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('syncQueue');
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading pending changes:', error);
    }
  }

  private async savePendingChanges(): Promise<void> {
    try {
      // Compress data before storing
      const compressed = await this.compressData(this.queue);
      await AsyncStorage.setItem('syncQueue', compressed);
    } catch (error) {
      console.error('Error saving pending changes:', error);
    }
  }

  private async compressData(data: any): Promise<string> {
    // Simple compression: remove unnecessary fields and use shorter keys
    const compressed = JSON.stringify(data);
    // For large data, you could use a compression library here
    return compressed;
  }

  // Study data caching
  async getStudyData(deckId?: number, forceRefresh: boolean = false): Promise<any> {
    const cacheKey = `studyData_${deckId || 'all'}`;
    const cacheTimestampKey = `${cacheKey}_timestamp`;
    const cacheMaxAge = 5 * 60 * 1000; // 5 minutes

    if (!forceRefresh) {
      try {
        const [cachedData, timestamp] = await Promise.all([
          AsyncStorage.getItem(cacheKey),
          AsyncStorage.getItem(cacheTimestampKey),
        ]);

        if (cachedData && timestamp) {
          const age = Date.now() - parseInt(timestamp);
          if (age < cacheMaxAge) {
            return JSON.parse(cachedData);
          }
        }
      } catch (error) {
        console.error('Error reading cache:', error);
      }
    }

    // Fetch from API
    try {
      const data = await apiService.getStudyQueue(deckId);
      
      // Update cache
      await Promise.all([
        AsyncStorage.setItem(cacheKey, JSON.stringify(data)),
        AsyncStorage.setItem(cacheTimestampKey, Date.now().toString()),
      ]);

      return data;
    } catch (error) {
      // If offline, try to return cached data even if stale
      try {
        const cachedData = await AsyncStorage.getItem(cacheKey);
        if (cachedData) {
          return JSON.parse(cachedData);
        }
      } catch (cacheError) {
        console.error('Error reading stale cache:', cacheError);
      }
      throw error;
    }
  }

  // Conflict resolution
  async resolveConflict(localChange: PendingChange, serverData: any): Promise<any> {
    // Simple conflict resolution: server wins for now
    // Can be enhanced with more sophisticated strategies
    console.log('Resolving conflict for:', localChange.id);
    return serverData;
  }

  // Progress tracking
  onProgress(callback: (progress: SyncProgress) => void): () => void {
    this.progressCallbacks.push(callback);
    return () => {
      this.progressCallbacks = this.progressCallbacks.filter((cb) => cb !== callback);
    };
  }

  private notifyProgress(progress: SyncProgress): void {
    this.progressCallbacks.forEach((callback) => callback(progress));
  }

  // Battery-efficient sync
  setSyncInterval(intervalMs: number): void {
    this.syncIntervalMs = intervalMs;
    this.startSyncInterval();
  }

  // Cleanup
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.progressCallbacks = [];
  }
}

export const syncService = new SyncService();


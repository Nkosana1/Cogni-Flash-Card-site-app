/**
 * Enhanced push notification service
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './api';

interface NotificationPreferences {
  dailyReminderEnabled: boolean;
  dailyReminderTime: { hour: number; minute: number };
  dueCardNotificationsEnabled: boolean;
  dueCardThreshold: number;
  streakRemindersEnabled: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  dailyReminderEnabled: true,
  dailyReminderTime: { hour: 18, minute: 0 },
  dueCardNotificationsEnabled: true,
  dueCardThreshold: 5,
  streakRemindersEnabled: true,
};

export class NotificationService {
  private preferences: NotificationPreferences = DEFAULT_PREFERENCES;
  private notificationIds: string[] = [];

  async initialize(): Promise<boolean> {
    // Load preferences
    await this.loadPreferences();

    // Request permissions
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      return false;
    }

    // Setup notification handlers
    this.setupNotificationHandlers();

    // Schedule notifications
    await this.scheduleAllNotifications();

    return true;
  }

  private async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3b82f6',
        sound: true,
      });

      // Create additional channels
      await Notifications.setNotificationChannelAsync('study', {
        name: 'Study Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3b82f6',
        sound: true,
      });

      await Notifications.setNotificationChannelAsync('streak', {
        name: 'Streak Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250],
        lightColor: '#f97316',
        sound: false,
      });
    }

    return true;
  }

  private setupNotificationHandlers() {
    // Handle notification received while app is foregrounded
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    // Handle notification tapped
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      console.log('Notification tapped:', data);
      
      // Handle different notification types
      if (data.type === 'daily_reminder') {
        // Navigate to study screen
      } else if (data.type === 'due_cards') {
        // Navigate to study screen
      } else if (data.type === 'streak') {
        // Navigate to analytics screen
      }
    });
  }

  async scheduleAllNotifications(): Promise<void> {
    // Cancel all existing notifications
    await this.cancelAllNotifications();

    // Schedule daily reminder
    if (this.preferences.dailyReminderEnabled) {
      await this.scheduleDailyReminder();
    }

    // Schedule due card notifications
    if (this.preferences.dueCardNotificationsEnabled) {
      await this.scheduleDueCardNotifications();
    }

    // Schedule streak reminders
    if (this.preferences.streakRemindersEnabled) {
      await this.scheduleStreakReminders();
    }
  }

  async scheduleDailyReminder(): Promise<void> {
    const { hour, minute } = this.preferences.dailyReminderTime;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to Study! 📚',
        body: 'You have cards waiting for review',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'daily_reminder' },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });

    this.notificationIds.push(id);
    await this.saveNotificationIds();
  }

  async scheduleDueCardNotifications(): Promise<void> {
    try {
      const queue = await apiService.getStudyQueue();
      const dueCount = queue.due_count || 0;

      if (dueCount >= this.preferences.dueCardThreshold) {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: `${dueCount} cards due for review`,
            body: 'Keep your streak going!',
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            data: { type: 'due_cards', count: dueCount },
          },
          trigger: {
            seconds: 3600, // 1 hour from now
          },
        });

        this.notificationIds.push(id);
        await this.saveNotificationIds();
      }
    } catch (error) {
      console.error('Error scheduling due card notifications:', error);
    }
  }

  async scheduleStreakReminders(): Promise<void> {
    try {
      const streak = await apiService.getStreak();
      
      if (streak.current_streak > 0 && streak.current_streak % 7 === 0) {
        // Weekly milestone
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: `🔥 ${streak.current_streak} day streak!`,
            body: 'Amazing progress! Keep it up!',
            sound: false,
            priority: Notifications.AndroidNotificationPriority.DEFAULT,
            data: { type: 'streak', days: streak.current_streak },
          },
          trigger: {
            seconds: 86400, // 24 hours
          },
        });

        this.notificationIds.push(id);
        await this.saveNotificationIds();
      }
    } catch (error) {
      console.error('Error scheduling streak reminders:', error);
    }
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...preferences };
    await this.savePreferences();
    await this.scheduleAllNotifications();
  }

  async getPreferences(): Promise<NotificationPreferences> {
    return { ...this.preferences };
  }

  private async loadPreferences(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('notificationPreferences');
      if (stored) {
        this.preferences = { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  }

  private async savePreferences(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'notificationPreferences',
        JSON.stringify(this.preferences)
      );
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  }

  private async saveNotificationIds(): Promise<void> {
    try {
      await AsyncStorage.setItem('notificationIds', JSON.stringify(this.notificationIds));
    } catch (error) {
      console.error('Error saving notification IDs:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    this.notificationIds = [];
    await AsyncStorage.removeItem('notificationIds');
  }

  async cancelNotification(id: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(id);
    this.notificationIds = this.notificationIds.filter((nid) => nid !== id);
    await this.saveNotificationIds();
  }

  // Immediate notification (for testing or special events)
  async sendImmediateNotification(
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: data || {},
      },
      trigger: null, // Immediate
    });
  }
}

export const notificationService = new NotificationService();


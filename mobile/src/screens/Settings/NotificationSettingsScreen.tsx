/**
 * Notification settings screen
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { notificationService } from '@/services/NotificationService';
import { NotificationPreferences } from '@/services/NotificationService';

export default function NotificationSettingsScreen() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    dailyReminderEnabled: true,
    dailyReminderTime: { hour: 18, minute: 0 },
    dueCardNotificationsEnabled: true,
    dueCardThreshold: 5,
    streakRemindersEnabled: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await notificationService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: any) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    await notificationService.updatePreferences({ [key]: value });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Reminder</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Enable Daily Reminder</Text>
          <Switch
            value={preferences.dailyReminderEnabled}
            onValueChange={(value) =>
              updatePreference('dailyReminderEnabled', value)
            }
          />
        </View>
        {preferences.dailyReminderEnabled && (
          <Text style={styles.settingDescription}>
            Reminder at {preferences.dailyReminderTime.hour}:{String(preferences.dailyReminderTime.minute).padStart(2, '0')}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Due Cards</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Notify When Cards Due</Text>
          <Switch
            value={preferences.dueCardNotificationsEnabled}
            onValueChange={(value) =>
              updatePreference('dueCardNotificationsEnabled', value)
            }
          />
        </View>
        {preferences.dueCardNotificationsEnabled && (
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>
              Threshold: {preferences.dueCardThreshold} cards
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Streak Reminders</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Enable Streak Reminders</Text>
          <Switch
            value={preferences.streakRemindersEnabled}
            onValueChange={(value) =>
              updatePreference('streakRemindersEnabled', value)
            }
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.testButton}
        onPress={async () => {
          await notificationService.sendImmediateNotification(
            'Test Notification',
            'This is a test notification from NeuroFlash'
          );
        }}
      >
        <Text style={styles.testButtonText}>Send Test Notification</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  testButton: {
    margin: 16,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


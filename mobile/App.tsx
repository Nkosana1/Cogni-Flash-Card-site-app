/**
 * Main App component
 */
import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { registerBackgroundSync } from './src/services/sync';
import { syncService } from './src/services/SyncService';
import { notificationService } from './src/services/NotificationService';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function App() {
  const [initializing, setInitializing] = React.useState(true);

  React.useEffect(() => {
    async function initialize() {
      try {
        // Initialize sync service
        await syncService.initialize();

        // Initialize notification service
        await notificationService.initialize();

        // Register background sync
        await registerBackgroundSync();
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setInitializing(false);
      }
    }

    initialize();

    // Cleanup on unmount
    return () => {
      syncService.destroy();
    };
  }, []);

  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StatusBar style="auto" />
        <AppNavigator />
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});


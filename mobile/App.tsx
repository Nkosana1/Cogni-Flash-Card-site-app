/**
 * Main App component
 */
import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { registerBackgroundSync } from './src/services/sync';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  React.useEffect(() => {
    // Register background sync
    registerBackgroundSync();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StatusBar style="auto" />
        <AppNavigator />
      </PersistGate>
    </Provider>
  );
}


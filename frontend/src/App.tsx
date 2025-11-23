import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';
import { store, persistor } from './store';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
              <Toaster position="top-right" />
              {/* App content will go here */}
              <div className="p-8 text-center">
                <h1 className="text-3xl font-bold text-primary-600 mb-4">NeuroFlash</h1>
                <p className="text-gray-600">Redux Toolkit state management ready</p>
              </div>
            </div>
          </BrowserRouter>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;

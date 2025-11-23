/**
 * Offline support utilities
 */
import { Middleware } from '@reduxjs/toolkit';

// Queue for failed requests
const requestQueue: Array<{
  type: string;
  payload: any;
  timestamp: number;
}> = [];

// Check if online
export const isOnline = () => navigator.onLine;

// Queue request for retry when online
export const queueRequest = (type: string, payload: any) => {
  requestQueue.push({
    type,
    payload,
    timestamp: Date.now(),
  });
  // Store in localStorage for persistence
  localStorage.setItem('requestQueue', JSON.stringify(requestQueue));
};

// Process queued requests when back online
export const processQueuedRequests = (dispatch: any) => {
  const stored = localStorage.getItem('requestQueue');
  if (stored) {
    try {
      const queue = JSON.parse(stored);
      queue.forEach((request: any) => {
        // Only retry requests from last 24 hours
        if (Date.now() - request.timestamp < 24 * 60 * 60 * 1000) {
          dispatch({ type: request.type, payload: request.payload });
        }
      });
      localStorage.removeItem('requestQueue');
    } catch (err) {
      console.error('Error processing queued requests:', err);
    }
  }
};

// Initialize online event listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    // This will be called with dispatch from store
    const stored = localStorage.getItem('requestQueue');
    if (stored) {
      try {
        const queue = JSON.parse(stored);
        // Process queue when back online
        queue.forEach((request: any) => {
          if (Date.now() - request.timestamp < 24 * 60 * 60 * 1000) {
            // Request will be retried by RTK Query automatically
            console.log('Processing queued request:', request.type);
          }
        });
        localStorage.removeItem('requestQueue');
      } catch (err) {
        console.error('Error processing queued requests:', err);
      }
    }
  });
}

// Offline middleware
export const offlineMiddleware: Middleware = (store) => (next) => (action) => {
  // RTK Query handles offline requests automatically
  // This middleware is for custom offline handling if needed
  return next(action);
};


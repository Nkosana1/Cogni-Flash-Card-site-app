/**
 * Error handling utilities
 */
import { isRejectedWithValue, Middleware } from '@reduxjs/toolkit';
import type { SerializedError } from '@reduxjs/toolkit';

interface ErrorResponse {
  error?: string;
  message?: string;
  data?: {
    error?: string;
    messages?: Record<string, string[]>;
  };
}

export const errorHandlerMiddleware: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const error = action.payload as ErrorResponse | SerializedError;
    
    let errorMessage = 'An error occurred';
    
    if ('error' in error && typeof error.error === 'string') {
      errorMessage = error.error;
    } else if ('data' in error && error.data) {
      if (typeof error.data.error === 'string') {
        errorMessage = error.data.error;
      } else if (error.data.messages) {
        errorMessage = Object.values(error.data.messages).flat().join(', ');
      }
    } else if ('message' in error) {
      errorMessage = error.message || errorMessage;
    }

    // You can dispatch a notification action here
    console.error('API Error:', errorMessage);
  }

  return next(action);
};


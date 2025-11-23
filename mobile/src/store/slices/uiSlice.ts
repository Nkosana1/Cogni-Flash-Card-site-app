/**
 * UI slice for mobile
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark';
  offlineMode: boolean;
  notificationsEnabled: boolean;
}

const initialState: UIState = {
  theme: 'light',
  offlineMode: false,
  notificationsEnabled: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setOfflineMode: (state, action: PayloadAction<boolean>) => {
      state.offlineMode = action.payload;
    },
    setNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.notificationsEnabled = action.payload;
    },
  },
});

export const { setTheme, setOfflineMode, setNotificationsEnabled } = uiSlice.actions;

export default uiSlice.reducer;


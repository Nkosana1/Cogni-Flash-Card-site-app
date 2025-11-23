# NeuroFlash Mobile App

React Native mobile app built with Expo for the NeuroFlash spaced repetition platform.

## Features

- 📱 **Offline-first architecture** - Study without internet
- 🔔 **Push notifications** - Daily review reminders
- 📊 **Analytics dashboard** - Track your progress
- 🎯 **Swipe gestures** - Intuitive card navigation
- 💾 **Background sync** - Automatic data synchronization
- 🎨 **Touch-optimized UI** - Mobile-first design

## Getting Started

```bash
# Install dependencies
npm install

# Start Expo
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure

```
mobile/
├── src/
│   ├── screens/        # Screen components
│   ├── components/     # Reusable components
│   ├── navigation/     # Navigation setup
│   ├── services/       # API, sync, notifications
│   ├── store/         # Redux store
│   └── types/         # TypeScript types
└── assets/            # Images, icons, fonts
```

## Key Technologies

- **Expo SDK 50** - React Native framework
- **React Navigation** - Navigation library
- **Redux Toolkit** - State management
- **AsyncStorage** - Local storage
- **Expo Notifications** - Push notifications
- **React Native Gesture Handler** - Gestures
- **Chart Kit** - Analytics charts

## Mobile-Specific Features

### Offline Support
- Request queueing when offline
- Automatic sync when back online
- Local data persistence

### Background Sync
- Periodic background updates
- Battery-optimized sync intervals
- Automatic retry on failure

### Push Notifications
- Daily study reminders
- Due card notifications
- Customizable notification times

## Development

See `docs/MOBILE_IMPLEMENTATION.md` for detailed documentation.


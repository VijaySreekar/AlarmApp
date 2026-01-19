# Alarm App

A React Native alarm clock app built with Expo.

## Features

- Set multiple alarms with custom labels
- Toggle alarms on/off
- Set repeat options (Once, Daily, Weekdays, Weekends, specific days)
- Delete alarms
- Clean, modern UI
- Notification support for alarm triggers

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on your device:
```bash
npm run android    # For Android
npm run ios        # For iOS (requires macOS)
npm run web        # For web browser
```

## Project Structure

- `App.js` - Main app component
- `components/` - React components
  - `AlarmItem.js` - Individual alarm display component
  - `AddAlarmModal.js` - Modal for adding new alarms
- `hooks/` - Custom React hooks
  - `useAlarms.js` - Alarm state management and notification handling

## Dependencies

- React Native with Expo
- Expo Notifications for alarm notifications
- React Navigation for navigation (if needed in future)

## Notes

- This app uses Expo Go for easy development and testing
- Notifications require proper permissions on the device
- Alarms are stored in memory (in a production app, you'd want persistent storage)

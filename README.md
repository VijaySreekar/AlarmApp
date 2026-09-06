# Alarm App

A React Native and Expo alarm clock prototype with labelled alarms, local storage, and a five-minute snooze.

## Features

- Add, edit, enable, disable, and delete alarms.
- Choose a time using the native time picker on mobile.
- Save alarms on the device with AsyncStorage.
- Schedule local notifications with Expo Notifications.
- Snooze an alarm for five minutes.

## Run locally

```bash
git clone https://github.com/VijaySreekar/AlarmApp.git
cd AlarmApp
npm ci
npm start
```

The project uses Expo SDK 54. Platform shortcuts are also available:

```bash
npm run android
npm run ios
npm run web
```

The iOS simulator requires macOS. Check notification and sound behaviour on a mobile device; the browser preview is mainly useful for the interface.

## Current limits

Alarms are scheduled for the next occurrence of the selected time. Daily, weekday, and custom repeat schedules are not implemented, even though some starter records contain repeat labels.

Notification delivery depends on device permissions and operating-system behaviour. This is a prototype, and background alarm reliability still needs device testing.

## Code layout

| File or folder | Purpose |
| --- | --- |
| `App.js` | App entry component |
| `components/` | Alarm list, add/edit form, settings, and alarm screen |
| `hooks/useAlarms.js` | Storage, notification scheduling, cancellation, and snooze |
| `context/ThemeContext.js` | Theme state and colours |

See [the changelog](documentation/changelog.md) for development notes.

# Changelog

## [1.1.0] - 2026-01-19

### Fixed
- **Notification system**: Fixed random notification triggers by implementing proper notification deduplication and immediate cancellation after trigger
- **Notification cleanup**: Added `clearAllNotifications` function to properly cancel all scheduled notifications on app start and alarm dismiss

### Added
- **Theme system**: Added `ThemeContext` for global theme management with HSL-based color generation
- **Color slider**: Added settings modal with hue slider to customize app theme color (0-360 degrees)
- **Preset colors**: Added 8 preset color options for quick theme selection

### Changed
- **Minimalistic UI redesign**: 
  - Dark theme by default with clean typography
  - Simplified alarm list with larger time display (48px font, weight 200)
  - Streamlined add/edit modal with only essential fields (time, label, snooze)
  - Clean alarm screen with minimal buttons
  - Removed test buttons from main UI
- **AlarmItem**: Simplified toggle switch design, removed ON/OFF text
- **AddAlarmModal**: Removed repeat and sound options for cleaner interface
- **AlarmScreen**: Cleaner layout with thin font weights and themed buttons

### Technical
- Added `@react-native-community/slider` dependency for theme color picker
- Created `context/ThemeContext.js` for theme state management
- Created `components/SettingsModal.js` for theme customization
- Improved notification scheduling with unique identifiers per alarm
- Added `data.isAlarm` flag to notifications for reliable identification

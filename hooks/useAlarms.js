import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

let alarmTriggerCallback = null;
let processedNotifications = new Set();

export const setAlarmTriggerCallback = (callback) => {
  alarmTriggerCallback = callback;
};

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const notifId = notification.request.identifier;
    
    // Prevent duplicate processing
    if (processedNotifications.has(notifId)) {
      return {
        shouldShowBanner: false,
        shouldShowList: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      };
    }
    
    const data = notification.request.content.data || {};
    const isAlarm = data?.isAlarm === true;
    
    if (isAlarm) {
      processedNotifications.add(notifId);

      const alarmId = data?.alarmId;
      const label = notification.request.content.body || 'Alarm';

      if (alarmTriggerCallback) {
        // Avoid blocking the notification handler (can delay delivery).
        setTimeout(() => alarmTriggerCallback({ alarmId, label }), 0);
      }
      
      // Clean up old processed notifications after 1 minute
      setTimeout(() => processedNotifications.delete(notifId), 60000);
      
      return {
        shouldShowBanner: false,
        shouldShowList: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      };
    }
    
    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
});

export const useAlarms = () => {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await setupNotificationChannel();
      const hasPermission = await requestPermissions();
      const loadedAlarms = await loadAlarms();
      if (hasPermission) {
        await syncAlarmNotifications(loadedAlarms);
      }
    })();
  }, []);

  const setupNotificationChannel = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('alarm-channel', {
        name: 'Alarm Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        enableVibrate: true,
        vibratePattern: [0, 250, 250, 250],
      });
    }
  };

  const requestPermissions = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        Alert.alert(
          'Permissions Required',
          'Please enable notifications in Settings to use alarms. Go to Settings > Notifications > Expo Go and allow notifications.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Notifications.openSettings() }
          ]
        );
        return false;
      }
      
      // For iOS, also request badge permissions
      if (Platform.OS === 'ios') {
        await Notifications.setBadgeCountAsync(0);
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  const loadAlarms = async () => {
    try {
      const storedAlarms = await AsyncStorage.getItem('alarms');
      if (storedAlarms) {
        const parsedAlarms = JSON.parse(storedAlarms);
        setAlarms(parsedAlarms);
        return parsedAlarms;
      } else {
        // Set some default alarms for demo purposes
        const defaultAlarms = [
          {
            id: '1',
            time: '07:00',
            label: 'Wake up',
            repeat: 'Daily',
            sound: 'Gentle',
            snooze: true,
            enabled: true,
          },
          {
            id: '2',
            time: '09:00',
            label: 'Morning meeting',
            repeat: 'Weekdays',
            sound: 'Bell',
            snooze: false,
            enabled: false,
          }
        ];
        setAlarms(defaultAlarms);
        await AsyncStorage.setItem('alarms', JSON.stringify(defaultAlarms));
        return defaultAlarms;
      }
    } catch (error) {
      console.error('Error loading alarms:', error);
      // Fallback to empty array if storage fails
      setAlarms([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addAlarm = async (alarm) => {
    console.log('addAlarm called with:', alarm);
    try {
      const newAlarms = [...alarms, alarm];
      console.log('newAlarms:', newAlarms);
      setAlarms(newAlarms);
      
      // Don't wait for storage to complete for immediate UI update
      AsyncStorage.setItem('alarms', JSON.stringify(newAlarms))
        .then(() => console.log('Alarm saved to storage'))
        .catch(error => console.error('Storage error:', error));
      
      // Check permissions before scheduling notification
      const hasPermission = await requestPermissions();
      if (hasPermission) {
        await scheduleNotification(alarm);
      } else {
        console.log('Alarm saved but notification not scheduled due to permissions');
      }
      
      console.log('Alarm added successfully');
    } catch (error) {
      console.error('Error in addAlarm:', error);
    }
  };

  const toggleAlarm = async (id) => {
    const alarm = alarms.find(a => a.id === id);
    if (!alarm) return;
    
    const updatedAlarms = alarms.map(a => 
      a.id === id ? { ...a, enabled: !a.enabled } : a
    );
    setAlarms(updatedAlarms);
    await AsyncStorage.setItem('alarms', JSON.stringify(updatedAlarms));
    
    // Handle notification scheduling
    if (alarm.enabled) {
      // Alarm was enabled, now disabling - cancel notification
      console.log('Disabling alarm, cancelling notification:', id);
      cancelNotification(id);
    } else {
      // Alarm was disabled, now enabling - schedule notification
      console.log('Enabling alarm, scheduling notification:', id);
      const hasPermission = await requestPermissions();
      if (hasPermission) {
        await scheduleNotification(alarm);
      } else {
        console.log('Cannot enable alarm - no notification permissions');
      }
    }
  };

  const deleteAlarm = async (id) => {
    const updatedAlarms = alarms.filter(alarm => alarm.id !== id);
    setAlarms(updatedAlarms);
    await AsyncStorage.setItem('alarms', JSON.stringify(updatedAlarms));
    cancelNotification(id);
  };

  const editAlarm = async (updatedAlarm) => {
    console.log('editAlarm called with:', updatedAlarm);
    try {
      const updatedAlarms = alarms.map(alarm => 
        alarm.id === updatedAlarm.id ? updatedAlarm : alarm
      );
      console.log('updatedAlarms:', updatedAlarms);
      setAlarms(updatedAlarms);
      
      // Don't wait for storage to complete for immediate UI update
      AsyncStorage.setItem('alarms', JSON.stringify(updatedAlarms))
        .then(() => console.log('Alarm updated in storage'))
        .catch(error => console.error('Storage error:', error));
      
      // Reschedule notification if alarm is enabled
      if (updatedAlarm.enabled) {
        cancelNotification(updatedAlarm.id);
        await scheduleNotification(updatedAlarm);
      } else {
        cancelNotification(updatedAlarm.id);
      }
      
      console.log('Alarm updated successfully');
    } catch (error) {
      console.error('Error in editAlarm:', error);
    }
  };

  const scheduleNotification = async (alarm, options = {}) => {
    try {
      const { skipCancel = false } = options;
      // Cancel any existing notification for this alarm first
      if (!skipCancel) {
        await cancelNotification(alarm.id);
      }
      
      const [hours, minutes] = alarm.time.split(':').map(Number);
      const now = new Date();
      const alarmDate = new Date();
      alarmDate.setHours(hours, minutes, 0, 0);
      alarmDate.setMilliseconds(0);
      
      if (alarmDate <= now) {
        alarmDate.setDate(alarmDate.getDate() + 1);
      }

      const baseContent = {
        title: 'Alarm',
        body: alarm.label || 'Alarm',
        sound: 'default',
        priority: 'high',
        data: { isAlarm: true, alarmId: alarm.id },
      };

      const content =
        Platform.OS === 'android'
          ? { ...baseContent, channelId: 'alarm-channel' }
          : baseContent;

      const trigger =
        Platform.OS === 'android'
          ? {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: alarmDate,
              channelId: 'alarm-channel',
            }
          : { type: Notifications.SchedulableTriggerInputTypes.DATE, date: alarmDate };

      await Notifications.scheduleNotificationAsync({
        identifier: `alarm-${alarm.id}`,
        content: {
          ...content,
        },
        trigger,
      });
      
      console.log('Alarm scheduled:', alarm.label, 'at', alarmDate.toLocaleTimeString());
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const cancelNotification = async (id) => {
    try {
      try {
        await Notifications.cancelScheduledNotificationAsync(`alarm-${id}`);
      } catch (e) {}

      // Cancel all notifications that match this alarm ID
      const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
      for (const notif of allNotifications) {
        if (notif.identifier.includes(id) || notif.content.data?.alarmId === id) {
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
      }
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  };

  const clearAlarmNotifications = async () => {
    try {
      const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
      for (const notif of allNotifications) {
        const isAlarmNotif = notif.content.data?.isAlarm === true;
        const isAlarmIdentifier = notif.identifier.startsWith('alarm-') || notif.identifier.startsWith('snooze-');
        if (isAlarmNotif || isAlarmIdentifier) {
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
      }

      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Error clearing alarm notifications:', error);
    }
  };

  const syncAlarmNotifications = async (alarmsToSync = alarms) => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      await clearAlarmNotifications();

      for (const alarm of alarmsToSync) {
        if (alarm.enabled) {
          await scheduleNotification(alarm, { skipCancel: true });
        }
      }
    } catch (error) {
      console.error('Error syncing alarm notifications:', error);
    }
  };

  const getScheduledNotifications = async () => {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('All scheduled notifications:', scheduledNotifications);
      return scheduledNotifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  };

  const cancelSnoozeNotification = async (alarmId) => {
    if (!alarmId) return;
    try {
      try {
        await Notifications.cancelScheduledNotificationAsync(`snooze-${alarmId}`);
      } catch (e) {}

      const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
      for (const notif of allNotifications) {
        if (notif.identifier === `snooze-${alarmId}` || notif.content.data?.alarmId === alarmId) {
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
      }
    } catch (error) {
      console.error('Error canceling snooze notification:', error);
    }
  };

  const snoozeAlarm = async ({ alarmId, label, minutes = 5 }) => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      await cancelSnoozeNotification(alarmId);

      const baseContent = {
        title: 'Alarm',
        body: label || 'Alarm',
        sound: 'default',
        priority: 'high',
        data: { isAlarm: true, alarmId },
      };

      const content =
        Platform.OS === 'android'
          ? { ...baseContent, channelId: 'alarm-channel' }
          : baseContent;

      const snoozeDate = new Date(Date.now() + minutes * 60 * 1000);
      const trigger =
        Platform.OS === 'android'
          ? {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: snoozeDate,
              channelId: 'alarm-channel',
            }
          : { type: Notifications.SchedulableTriggerInputTypes.DATE, date: snoozeDate };

      await Notifications.scheduleNotificationAsync({
        identifier: `snooze-${alarmId}`,
        content: {
          ...content,
        },
        trigger,
      });
    } catch (error) {
      console.error('Error scheduling snooze alarm:', error);
    }
  };

  const stopAlarm = async (alarmId) => {
    try {
      if (alarmId) {
        await cancelSnoozeNotification(alarmId);
        await cancelNotification(alarmId);
      }
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Error stopping alarm:', error);
    }
  };

  return {
    alarms,
    loading,
    addAlarm,
    editAlarm,
    toggleAlarm,
    deleteAlarm,
    getScheduledNotifications,
    stopAlarm,
    snoozeAlarm,
    syncAlarmNotifications,
  };
};

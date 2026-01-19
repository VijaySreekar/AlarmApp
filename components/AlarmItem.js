import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../context/ThemeContext';

const formatTime12h = (timeString) => {
  const [hRaw, mRaw] = (timeString || '').split(':').map((v) => parseInt(v, 10));
  const hours = Number.isFinite(hRaw) ? hRaw : 0;
  const minutes = Number.isFinite(mRaw) ? mRaw : 0;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = ((hours + 11) % 12) + 1;
  return {
    time: `${hour12}:${String(minutes).padStart(2, '0')}`,
    ampm,
  };
};

const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const computeNextOccurrence = (alarm) => {
  const now = new Date();
  const [hRaw, mRaw] = (alarm?.time || '').split(':').map((v) => parseInt(v, 10));
  const hours = Number.isFinite(hRaw) ? hRaw : 0;
  const minutes = Number.isFinite(mRaw) ? mRaw : 0;

  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);

  const repeat = (alarm?.repeat || '').toLowerCase();

  if (repeat === 'weekdays') {
    while (next <= now || isWeekend(next)) {
      next.setDate(next.getDate() + 1);
      next.setHours(hours, minutes, 0, 0);
    }
    return next;
  }

  if (repeat === 'weekends') {
    while (next <= now || !isWeekend(next)) {
      next.setDate(next.getDate() + 1);
      next.setHours(hours, minutes, 0, 0);
    }
    return next;
  }

  if (next <= now) {
    next.setDate(next.getDate() + 1);
    next.setHours(hours, minutes, 0, 0);
  }

  return next;
};

const formatShortDate = (date) => {
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekday = weekdays[date.getDay()] ?? '';
  const month = months[date.getMonth()] ?? '';
  const day = date.getDate();
  return `${weekday}, ${month} ${day}`;
};

const AlarmItem = ({ alarm, onToggle, onDelete, onEdit }) => {
  const { colors } = useTheme();
  const swipeRef = useRef(null);

  const dynamicStyles = {
    container: { backgroundColor: colors.surface, borderBottomColor: colors.border },
    time: { color: alarm.enabled ? colors.text : colors.textMuted },
    label: { color: alarm.enabled ? colors.textSecondary : colors.textMuted },
    toggle: { backgroundColor: alarm.enabled ? colors.primary : colors.surfaceLight },
  };

  const renderRightActions = (progress) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [96, 0],
    });
    const opacity = progress.interpolate({
      inputRange: [0, 0.2, 1],
      outputRange: [0, 0.8, 1],
    });

    return (
      <Animated.View
        style={[
          styles.rightAction,
          { backgroundColor: colors.danger, transform: [{ translateX }], opacity },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete alarm"
          onPress={() => {
            swipeRef.current?.close?.();
            onDelete(alarm.id);
          }}
          style={styles.rightActionPressable}
        >
          <Text style={styles.rightActionText}>Delete</Text>
        </Pressable>
      </Animated.View>
    );
  };

  const { time, ampm } = formatTime12h(alarm.time);
  const nextDate = computeNextOccurrence(alarm);
  const dateLabel = formatShortDate(nextDate);

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      rightThreshold={80}
      overshootRight={false}
      friction={2}
      useNativeAnimations
      onSwipeableRightOpen={() => onDelete(alarm.id)}
    >
      <TouchableOpacity
        style={[styles.container, dynamicStyles.container]}
        onPress={() => onEdit(alarm)}
        activeOpacity={0.7}
      >
        <View style={styles.colLeft}>
          <Text style={[styles.labelTop, dynamicStyles.label]} numberOfLines={1} ellipsizeMode="tail">
            {alarm.label}
          </Text>
          <View style={styles.timeRow}>
            <Text style={[styles.timeBottom, dynamicStyles.time]} numberOfLines={1}>
              {time}
            </Text>
            <Text style={[styles.ampm, { color: alarm.enabled ? colors.textSecondary : colors.textMuted }]}>
              {ampm}
            </Text>
          </View>
        </View>

        <View style={styles.colMid}>
          <Text style={[styles.dateText, { color: alarm.enabled ? colors.textSecondary : colors.textMuted }]}>
            {dateLabel}
          </Text>
        </View>

        <View style={styles.colRight}>
          <TouchableOpacity
            style={[styles.toggle, dynamicStyles.toggle]}
            onPress={(e) => {
              e?.stopPropagation?.();
              onToggle(alarm.id);
            }}
          >
            <View style={[styles.toggleDot, alarm.enabled && styles.toggleDotActive]} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  colLeft: {
    flex: 1,
    paddingRight: 12,
  },
  colMid: {
    width: 120,
    alignItems: 'flex-start',
    paddingRight: 12,
  },
  colRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  labelTop: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 6,
    gap: 6,
  },
  timeBottom: {
    fontSize: 34,
    fontWeight: '200',
    letterSpacing: -1,
  },
  ampm: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  toggle: {
    width: 52,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  toggleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#666',
  },
  toggleDotActive: {
    alignSelf: 'flex-end',
    backgroundColor: '#fff',
  },
  rightAction: {
    width: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightActionPressable: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default AlarmItem;

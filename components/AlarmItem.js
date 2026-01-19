import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../context/ThemeContext';

const AlarmItem = ({ alarm, onToggle, onDelete, onEdit }) => {
  const { colors } = useTheme();
  const swipeRef = useRef(null);

  const dynamicStyles = {
    container: { backgroundColor: colors.surface, borderBottomColor: colors.border },
    time: { color: alarm.enabled ? colors.text : colors.textMuted },
    label: { color: alarm.enabled ? colors.textSecondary : colors.textMuted },
    toggle: { backgroundColor: alarm.enabled ? colors.primary : colors.surfaceLight },
  };

  const renderRightActions = () => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Delete alarm"
      onPress={() => {
        swipeRef.current?.close?.();
        onDelete(alarm.id);
      }}
      style={[styles.rightAction, { backgroundColor: colors.danger }]}
    >
      <Text style={styles.rightActionText}>Delete</Text>
    </Pressable>
  );

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
    >
      <TouchableOpacity
        style={[styles.container, dynamicStyles.container]}
        onPress={() => onEdit(alarm)}
        activeOpacity={0.7}
      >
        <View style={styles.mainContent}>
          <Text
            style={[styles.time, dynamicStyles.time]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {alarm.time}
          </Text>
          <Text style={[styles.label, dynamicStyles.label]} numberOfLines={1} ellipsizeMode="tail">
            {alarm.label}
          </Text>
        </View>
        <View style={styles.controls}>
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
  mainContent: {
    flex: 1,
    paddingRight: 12,
  },
  time: {
    fontSize: 48,
    fontWeight: '200',
    letterSpacing: -1,
  },
  label: {
    fontSize: 14,
    fontWeight: '300',
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
  rightActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default AlarmItem;

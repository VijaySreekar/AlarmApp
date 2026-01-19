import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const degToRad = (deg) => (deg * Math.PI) / 180;

const FloatingActionMenu = ({ onAddCustom, onAddTestOneMin }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: open ? 180 : 140,
      useNativeDriver: true,
    }).start();
  }, [open, progress]);

  const actions = useMemo(() => {
    const distance = 110;
    const leftAngle = degToRad(-30);
    const rightAngle = degToRad(30);

    return [
      {
        key: 'testOneMin',
        labelTop: '+1 min',
        labelBottom: 'test alarm',
        translateX: distance * Math.sin(leftAngle),
        translateY: -distance * Math.cos(leftAngle),
        onPress: onAddTestOneMin,
      },
      {
        key: 'addCustom',
        labelTop: 'Add',
        labelBottom: 'custom',
        translateX: distance * Math.sin(rightAngle),
        translateY: -distance * Math.cos(rightAngle),
        onPress: onAddCustom,
      },
    ];
  }, [onAddCustom, onAddTestOneMin]);

  const containerBottom = insets.bottom + 24;

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {open && (
        <Pressable
          accessibilityLabel="Close actions"
          onPress={() => setOpen(false)}
          style={[StyleSheet.absoluteFill, styles.backdrop]}
        />
      )}

      <View pointerEvents="box-none" style={[styles.container, { bottom: containerBottom }]}>
        <View pointerEvents="box-none" style={styles.rig}>
          {actions.map((action) => {
            const translateX = progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, action.translateX],
            });
            const translateY = progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, action.translateY],
            });
            const scale = progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.6, 1],
            });
            const opacity = progress.interpolate({
              inputRange: [0, 0.7, 1],
              outputRange: [0, 0.8, 1],
            });

            return (
              <Animated.View
                key={action.key}
                pointerEvents={open ? 'auto' : 'none'}
                style={[
                  styles.actionWrap,
                  {
                    transform: [{ translateX }, { translateY }, { scale }],
                    opacity,
                  },
                ]}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={action.labelTop}
                  onPress={() => {
                    setOpen(false);
                    action.onPress?.();
                  }}
                  style={[
                    styles.actionButton,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.actionTop, { color: colors.text }]}>{action.labelTop}</Text>
                  <Text style={[styles.actionBottom, { color: colors.textMuted }]}>
                    {action.labelBottom}
                  </Text>
                </Pressable>
              </Animated.View>
            );
          })}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={open ? 'Close menu' : 'Open menu'}
            onPress={() => setOpen((v) => !v)}
            style={[styles.fab, { backgroundColor: colors.primary }]}
          >
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '45deg'],
                    }),
                  },
                ],
              }}
            >
              <Text style={styles.fabText}>+</Text>
            </Animated.View>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  rig: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  actionWrap: {
    position: 'absolute',
    bottom: 72,
  },
  actionButton: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  actionTop: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  actionBottom: {
    fontSize: 10,
    fontWeight: '400',
    marginTop: 2,
  },
  fab: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  fabText: {
    fontSize: 40,
    fontWeight: '300',
    color: '#fff',
    marginTop: -2,
  },
});

export default FloatingActionMenu;


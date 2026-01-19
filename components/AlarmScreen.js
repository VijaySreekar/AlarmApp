import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Vibration, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { useTheme } from '../context/ThemeContext';

const AlarmScreen = ({ onDismiss, alarmLabel }) => {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const [time, setTime] = useState(new Date());
  const soundRef = useRef(null);

  const isCompact = width < 360 || height < 700;
  const timeFontSize = Math.min(96, Math.max(64, Math.floor(width * 0.24)));

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);

    const initAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        try {
          const { sound } = await Audio.Sound.createAsync(
            require('../assets/alarm-sound.mp3'),
            { shouldPlay: true, isLooping: true }
          );
          soundRef.current = sound;
        } catch (e) {
          soundRef.current = null;
        }
      } catch (e) {
        soundRef.current = null;
      }
    };

    initAudio();
    Vibration.vibrate([0, 500, 200, 500], true);

    return () => {
      clearInterval(interval);
      Vibration.cancel();
      stopSound();
    };
  }, []);

  const stopSound = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {}
      soundRef.current = null;
    }
  };

  const handleStop = () => {
    Vibration.cancel();
    stopSound();
    onDismiss();
  };

  const handleSnooze = () => {
    Vibration.cancel();
    stopSound();
    onDismiss(5);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar hidden />
      
      <View style={styles.content}>
        <Text
          style={[styles.time, { color: colors.text, fontSize: timeFontSize }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
        >
          {time.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit'
          })}
        </Text>
        
        <Text
          style={[styles.label, { color: colors.textSecondary }, isCompact && styles.labelCompact]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {alarmLabel || 'Alarm'}
        </Text>
        
        <View style={[styles.buttons, isCompact && styles.buttonsStack]}>
          <TouchableOpacity
            style={[styles.snoozeButton, { borderColor: colors.primary }, isCompact && styles.buttonFullWidth]}
            onPress={handleSnooze}
          >
            <Text style={[styles.snoozeText, { color: colors.primary }]}>Snooze</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.stopButton, { backgroundColor: colors.primary }, isCompact && styles.buttonFullWidth]}
            onPress={handleStop}
          >
            <Text style={styles.stopText}>Stop</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  time: {
    fontWeight: '100',
    letterSpacing: -4,
  },
  label: {
    fontSize: 20,
    fontWeight: '300',
    marginTop: 16,
    marginBottom: 80,
    textAlign: 'center',
  },
  labelCompact: {
    marginBottom: 40,
  },
  buttons: {
    flexDirection: 'row',
    gap: 20,
  },
  buttonsStack: {
    flexDirection: 'column',
    width: '100%',
    gap: 14,
  },
  buttonFullWidth: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  snoozeButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 2,
  },
  snoozeText: {
    fontSize: 18,
    fontWeight: '400',
  },
  stopButton: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
  },
  stopText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
  },
});

export default AlarmScreen;

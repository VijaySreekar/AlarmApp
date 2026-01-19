import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

// Convert HSL to RGB hex
const hslToHex = (h, s, l) => {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

export const ThemeProvider = ({ children }) => {
  const [hue, setHue] = useState(210); // Default blue hue
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // system | light | dark

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedHue = await AsyncStorage.getItem('themeHue');
      if (savedHue !== null) {
        setHue(parseInt(savedHue, 10));
      }

      const savedMode = await AsyncStorage.getItem('themeMode');
      if (savedMode === 'system' || savedMode === 'light' || savedMode === 'dark') {
        setThemeMode(savedMode);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const updateHue = async (newHue) => {
    setHue(newHue);
    try {
      await AsyncStorage.setItem('themeHue', newHue.toString());
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const updateThemeMode = async (mode) => {
    setThemeMode(mode);
    try {
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  };

  const isDark = themeMode === 'system' ? systemScheme !== 'light' : themeMode === 'dark';

  const base = isDark
    ? {
        background: '#191919',
        surface: '#242424',
        surfaceLight: '#2e2e2e',
        text: '#ffffff',
        textSecondary: '#888888',
        textMuted: '#555555',
        border: '#303030',
      }
    : {
        background: '#ffffff',
        surface: '#f4f5f7',
        surfaceLight: '#e9eaee',
        text: '#111111',
        textSecondary: '#444444',
        textMuted: '#777777',
        border: '#dcdde3',
      };

  const colors = {
    primary: hslToHex(hue, 70, 50),
    primaryLight: hslToHex(hue, 70, 95),
    primaryDark: hslToHex(hue, 70, 35),
    ...base,
    danger: '#ff4444',
    success: hslToHex(hue, 70, 45),
  };

  return (
    <ThemeContext.Provider value={{ hue, updateHue, themeMode, updateThemeMode, isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

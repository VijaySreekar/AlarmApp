import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const SettingsModal = ({ visible, onClose }) => {
  const { hue, updateHue, themeMode, updateThemeMode, colors } = useTheme();

  const colorPresets = [
    { hue: 0, name: 'Red' },
    { hue: 30, name: 'Orange' },
    { hue: 60, name: 'Yellow' },
    { hue: 120, name: 'Green' },
    { hue: 180, name: 'Cyan' },
    { hue: 210, name: 'Blue' },
    { hue: 270, name: 'Purple' },
    { hue: 300, name: 'Pink' },
    { hue: 330, name: 'Rose' },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeText, { color: colors.primary }]}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPEARANCE</Text>

          <View style={[styles.segmented, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {[
              { key: 'system', label: 'System' },
              { key: 'light', label: 'Light' },
              { key: 'dark', label: 'Dark' },
            ].map((opt) => {
              const selected = themeMode === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.segment,
                    selected && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                  ]}
                  onPress={() => updateThemeMode(opt.key)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      { color: selected ? colors.primaryDark : colors.textSecondary },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>THEME COLOR</Text>
          
          <View style={styles.colorSection}>
            <View style={[styles.colorPreview, { backgroundColor: colors.primary }]} />
          </View>

          <View style={styles.colorGrid}>
            {colorPresets.map((preset) => (
              <TouchableOpacity
                key={preset.hue}
                style={[
                  styles.colorOption,
                  { backgroundColor: colors.surface, borderColor: hue === preset.hue ? colors.primary : colors.border },
                  hue === preset.hue && styles.colorOptionSelected,
                ]}
                onPress={() => updateHue(preset.hue)}
              >
                <View style={[styles.colorDot, { backgroundColor: `hsl(${preset.hue}, 70%, 50%)` }]} />
                <Text style={[styles.colorName, { color: colors.textSecondary }]}>{preset.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '300',
    letterSpacing: 1,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 24,
  },
  segmented: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 32,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
  },
  colorSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  colorPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: '30%',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 2,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 8,
  },
  colorName: {
    fontSize: 12,
    fontWeight: '400',
  },
});

export default SettingsModal;

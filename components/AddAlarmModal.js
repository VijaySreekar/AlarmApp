import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView, Alert, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const DateTimePicker =
  Platform.OS === 'web' ? null : require('@react-native-community/datetimepicker').default;

const AddAlarmModal = ({ visible, onClose, onAdd, onEdit, editingAlarm }) => {
  const { colors, isDark } = useTheme();
  const [time, setTime] = useState('08:00');
  const [label, setLabel] = useState('');
  const [snooze, setSnooze] = useState(true);
  const [pickerDate, setPickerDate] = useState(() => {
    const d = new Date();
    d.setHours(8, 0, 0, 0);
    return d;
  });
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  React.useEffect(() => {
    if (editingAlarm) {
      const nextTime = editingAlarm.time || '08:00';
      setTime(nextTime);
      setLabel(editingAlarm.label || '');
      setSnooze(editingAlarm.snooze !== undefined ? editingAlarm.snooze : true);

      const [h, m] = nextTime.split(':').map(Number);
      const d = new Date();
      d.setHours(h || 0, m || 0, 0, 0);
      setPickerDate(d);
    } else {
      resetForm();
    }
  }, [editingAlarm, visible]);

  const validateTime = (timeString) => {
    const timeRegex = /^([0-9]{1,2}):([0-5][0-9])$/;
    if (!timeRegex.test(timeString)) return false;
    const [hours] = timeString.split(':').map(Number);
    return hours >= 0 && hours <= 23;
  };

  const formatTime = (date) => {
    const pad2 = (n) => n.toString().padStart(2, '0');
    return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  };

  const handlePickerChange = (event, selectedDate) => {
    if (Platform.OS !== 'ios') {
      setShowPicker(false);
    }
    if (!selectedDate) return;
    setPickerDate(selectedDate);
    setTime(formatTime(selectedDate));
  };

  const handleSave = () => {
    if (Platform.OS === 'web' && !validateTime(time)) {
      Alert.alert('Invalid Time', 'Enter time in HH:MM format (24-hour).');
      return;
    }
    if (!label.trim()) {
      Alert.alert('Label Required', 'Enter a label for your alarm.');
      return;
    }

    const alarmData = {
      time,
      label: label.trim(),
      snooze,
      enabled: true,
    };

    if (editingAlarm) {
      onEdit({ ...editingAlarm, ...alarmData });
    } else {
      onAdd({ id: Date.now().toString(), ...alarmData });
    }
    
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTime('08:00');
    setLabel('');
    setSnooze(true);
    const d = new Date();
    d.setHours(8, 0, 0, 0);
    setPickerDate(d);
    setShowPicker(Platform.OS === 'ios');
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    header: { borderBottomColor: colors.border },
    title: { color: colors.text },
    cancelText: { color: colors.textSecondary },
    saveText: { color: colors.primary },
    timeInput: { color: colors.text },
    hint: { color: colors.textMuted },
    label: { color: colors.textSecondary },
    textInput: { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
    switch: { backgroundColor: snooze ? colors.primary : colors.surfaceLight },
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.container, dynamicStyles.container]}>
        <View style={[styles.header, dynamicStyles.header]}>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={[styles.cancelText, dynamicStyles.cancelText]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.title, dynamicStyles.title]}>
            {editingAlarm ? 'Edit' : 'New Alarm'}
          </Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={[styles.saveText, dynamicStyles.saveText]}>Save</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.timeContainer}>
            {Platform.OS === 'web' || !DateTimePicker ? (
              <>
                <TextInput
                  style={[styles.timeInput, dynamicStyles.timeInput]}
                  value={time}
                  onChangeText={(text) => {
                    let cleaned = text.replace(/[^0-9]/g, '');
                    if (cleaned.length >= 3) {
                      cleaned = cleaned.slice(0, 2) + ':' + cleaned.slice(2, 4);
                    }
                    if (cleaned.length <= 5) setTime(cleaned);
                  }}
                  placeholder="08:00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  maxLength={5}
                />
                <Text style={[styles.hint, dynamicStyles.hint]}>24-hour format</Text>
              </>
            ) : (
              <>
                <Pressable
                  onPress={() => setShowPicker(true)}
                  style={styles.timePressable}
                >
                  <Text
                    style={[styles.timeInput, dynamicStyles.timeInput]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.6}
                  >
                    {time}
                  </Text>
                  <Text style={[styles.hint, dynamicStyles.hint]}>
                    {Platform.OS === 'ios' ? 'Scroll to set time' : 'Tap to set time'}
                  </Text>
                </Pressable>

                {(showPicker || Platform.OS === 'ios') && (
                  <View style={styles.pickerContainer}>
                    <DateTimePicker
                      value={pickerDate}
                      mode="time"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handlePickerChange}
                      minuteInterval={1}
                      themeVariant={isDark ? 'dark' : 'light'}
                    />
                  </View>
                )}
              </>
            )}
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, dynamicStyles.label]}>LABEL</Text>
            <TextInput
              style={[styles.textInput, dynamicStyles.textInput]}
              value={label}
              onChangeText={setLabel}
              placeholder="Alarm name"
              placeholderTextColor={colors.textMuted}
              maxLength={30}
            />
          </View>
          
          <View style={styles.fieldContainer}>
            <View style={styles.switchRow}>
              <Text style={[styles.label, dynamicStyles.label]}>SNOOZE</Text>
              <TouchableOpacity
                style={[styles.switch, dynamicStyles.switch]}
                onPress={() => setSnooze(!snooze)}
              >
                <View style={[styles.switchDot, snooze && styles.switchDotActive]} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.hint, dynamicStyles.hint]}>5 minute snooze</Text>
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
    fontSize: 18,
    fontWeight: '300',
    letterSpacing: 1,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '400',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  timeContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  timePressable: {
    alignItems: 'center',
  },
  timeInput: {
    fontSize: 72,
    fontWeight: '200',
    textAlign: 'center',
    letterSpacing: -2,
  },
  pickerContainer: {
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  hint: {
    fontSize: 12,
    fontWeight: '300',
    marginTop: 8,
  },
  fieldContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
  },
  textInput: {
    fontSize: 16,
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    fontWeight: '300',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switch: {
    width: 52,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  switchDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#666',
  },
  switchDotActive: {
    alignSelf: 'flex-end',
    backgroundColor: '#fff',
  },
});

export default AddAlarmModal;

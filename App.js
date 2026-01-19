import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useAlarms, setAlarmTriggerCallback } from './hooks/useAlarms';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import AlarmItem from './components/AlarmItem';
import AddAlarmModal from './components/AddAlarmModal';
import AlarmScreen from './components/AlarmScreen';
import SettingsModal from './components/SettingsModal';
import FloatingActionMenu from './components/FloatingActionMenu';

function MainApp() {
  const { colors, isDark } = useTheme();
  const { alarms, loading, addAlarm, editAlarm, toggleAlarm, deleteAlarm, stopAlarm, snoozeAlarm } = useAlarms();
  const [modalVisible, setModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState(null);
  const [alarmScreenVisible, setAlarmScreenVisible] = useState(false);
  const [currentAlarmId, setCurrentAlarmId] = useState(null);
  const [currentAlarmLabel, setCurrentAlarmLabel] = useState('');

  useEffect(() => {
    setAlarmTriggerCallback(({ alarmId, label }) => {
      setCurrentAlarmId(alarmId || null);
      setCurrentAlarmLabel(label || 'Alarm');
      setAlarmScreenVisible(true);
    });
  }, []);

  const testNow = () => {
    setCurrentAlarmId(`test-now-${Date.now()}`);
    setCurrentAlarmLabel('Test Alarm');
    setAlarmScreenVisible(true);
  };

  const testOneMin = async () => {
    const now = new Date();
    const testTime = new Date(now.getTime() + 60 * 1000);
    const timeString = testTime.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    }).slice(0, 5);
    
    await addAlarm({
      id: `test-${Date.now()}`,
      time: timeString,
      label: 'Test (1 min)',
      snooze: true,
      enabled: true,
      oneShot: true,
      triggerAt: testTime.toISOString(),
      autoDeleteAfterStop: true,
    });
  };

  const handleAlarmDismiss = async (snoozeMinutes = 0) => {
    const alarmId = currentAlarmId;
    const alarmLabel = currentAlarmLabel;
    setAlarmScreenVisible(false);
    setCurrentAlarmLabel('');
    setCurrentAlarmId(null);

    if (snoozeMinutes > 0) {
      await snoozeAlarm({ alarmId: alarmId || 'snooze', label: alarmLabel, minutes: snoozeMinutes });
      await stopAlarm();
      return;
    }

    await stopAlarm(alarmId);

    const stoppedAlarm = alarms.find((a) => a.id === alarmId);
    if (stoppedAlarm?.autoDeleteAfterStop) {
      await deleteAlarm(alarmId);
    }
  };

  const handleAddAlarm = () => {
    setEditingAlarm(null);
    setModalVisible(true);
  };

  const handleEditAlarm = (alarm) => {
    setEditingAlarm(alarm);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingAlarm(null);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  if (alarmScreenVisible) {
    return (
      <AlarmScreen
        onDismiss={handleAlarmDismiss}
        alarmLabel={currentAlarmLabel}
      />
    );
  }

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    header: { borderBottomColor: colors.border },
    headerTitle: { color: colors.text },
    testButton: { borderColor: colors.border, backgroundColor: colors.surface },
    settingsButton: { borderColor: colors.border },
    emptyText: { color: colors.textSecondary },
  };

  const listContentContainerStyle = [
    styles.listContentContainer,
    alarms.length === 0 && styles.emptyList,
  ];

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      <View style={[styles.header, dynamicStyles.header]}>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>AlarmApp</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.testNowButton, dynamicStyles.testButton]}
            onPress={testNow}
            accessibilityRole="button"
            accessibilityLabel="Test now"
          >
            <Text style={[styles.testNowText, { color: colors.textSecondary }]}>Test Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.settingsButton, dynamicStyles.settingsButton]}
            onPress={() => setSettingsVisible(true)}
          >
            <Text style={[styles.settingsIcon, { color: colors.textSecondary }]}>⚙</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={alarms}
        renderItem={({ item }) => (
          <AlarmItem
            alarm={item}
            onToggle={toggleAlarm}
            onDelete={deleteAlarm}
            onEdit={handleEditAlarm}
          />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, dynamicStyles.emptyText]}>No alarms</Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>Tap + to create one</Text>
          </View>
        }
        contentContainerStyle={listContentContainerStyle}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <FloatingActionMenu onAddCustom={handleAddAlarm} onAddTestOneMin={testOneMin} />

      <AddAlarmModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onAdd={addAlarm}
        onEdit={editAlarm}
        editingAlarm={editingAlarm}
      />

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SafeAreaProvider>
          <MainApp />
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '200',
    letterSpacing: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  testNowButton: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testNowText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 18,
  },
  list: {
    flex: 1,
  },
  listContentContainer: {
    paddingBottom: 180,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '300',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '300',
  },
});

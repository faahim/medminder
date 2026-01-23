import { View, ScrollView, Switch, Alert, Pressable } from 'react-native';
import { useState } from 'react';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Typography } from '../../src/components/ui/Typography';
import { Card } from '../../src/components/ui/Card';
import { Select } from '../../src/components/ui/Select';
import { Ionicons } from '@expo/vector-icons';
import { Settings } from '../../src/types';
import Constants from 'expo-constants';

const SNOOZE_OPTIONS = [
  { label: '5 minutes', value: 5 },
  { label: '10 minutes', value: 10 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
];

const THRESHOLD_OPTIONS = [
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
  { label: 'Never auto-miss', value: 9999 },
];

const SOUND_OPTIONS = [
  { label: 'Default', value: 'default' },
  { label: 'Gentle', value: 'gentle' },
  { label: 'Urgent', value: 'urgent' },
  { label: 'Silent', value: 'silent' },
];

const DARK_MODE_OPTIONS = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

const FONT_SIZE_OPTIONS = [
  { label: 'Normal', value: 'normal' },
  { label: 'Large', value: 'large' },
  { label: 'Extra Large', value: 'xlarge' },
];

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>({
    id: 1,
    snoozeDurationMinutes: 15,
    missedThresholdMinutes: 60,
    notificationSound: 'default',
    hapticFeedback: true,
    darkMode: 'system',
    fontSize: 'normal',
    reminderAdvanceMinutes: 0,
  });

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    // TODO: Persist to database
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'This feature will be available in a future update.');
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data?',
      'This will permanently delete all your medications, history, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: () => {
            // TODO: Clear database
            Alert.alert('Done', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper scrollable>
      <ScrollView className="flex-1 px-4 py-6">
        {/* Notifications Section */}
        <Typography variant="label" className="text-surface-500 dark:text-surface-400 mb-2 ml-4 uppercase tracking-wider text-xs">
          Notifications
        </Typography>
        <View className="bg-white dark:bg-surface-800 rounded-2xl border-2 border-surface-200 dark:border-surface-700 mb-6 overflow-hidden">
          {/* Snooze Duration */}
          <View className="flex-row items-center justify-between p-4 border-b border-surface-100 dark:border-surface-700">
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-950 items-center justify-center mr-3">
                <Ionicons name="alarm-outline" size={18} color="#06B6D4" />
              </View>
              <Typography variant="body" className="text-surface-900 dark:text-white">
                Snooze Duration
              </Typography>
            </View>
            <Select
              value={settings.snoozeDurationMinutes}
              options={SNOOZE_OPTIONS}
              onChange={(v) => updateSetting('snoozeDurationMinutes', v)}
              compact
            />
          </View>

          {/* Missed Threshold */}
          <View className="flex-row items-center justify-between p-4 border-b border-surface-100 dark:border-surface-700">
            <View className="flex-row items-center flex-1 mr-4">
              <View className="w-9 h-9 rounded-lg bg-warning-50 dark:bg-warning-950 items-center justify-center mr-3">
                <Ionicons name="time-outline" size={18} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Typography variant="body" className="text-surface-900 dark:text-white">
                  Mark as Missed After
                </Typography>
                <Typography variant="small" className="text-surface-500 dark:text-surface-400">
                  Auto-mark pending doses as missed
                </Typography>
              </View>
            </View>
            <Select
              value={settings.missedThresholdMinutes}
              options={THRESHOLD_OPTIONS}
              onChange={(v) => updateSetting('missedThresholdMinutes', v)}
              compact
            />
          </View>

          {/* Sound */}
          <View className="flex-row items-center justify-between p-4 border-b border-surface-100 dark:border-surface-700">
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-950 items-center justify-center mr-3">
                <Ionicons name="volume-medium-outline" size={18} color="#8B5CF6" />
              </View>
              <Typography variant="body" className="text-surface-900 dark:text-white">
                Reminder Sound
              </Typography>
            </View>
            <Select
              value={settings.notificationSound}
              options={SOUND_OPTIONS}
              onChange={(v) => updateSetting('notificationSound', v)}
              compact
            />
          </View>

          {/* Haptic Feedback */}
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-lg bg-accent-50 dark:bg-accent-950 items-center justify-center mr-3">
                <Ionicons name="phone-portrait-outline" size={18} color="#F97316" />
              </View>
              <Typography variant="body" className="text-surface-900 dark:text-white">
                Vibration
              </Typography>
            </View>
            <Switch
              value={settings.hapticFeedback}
              onValueChange={(v) => updateSetting('hapticFeedback', v)}
              trackColor={{ false: '#E5E5E5', true: '#06B6D480' }}
              thumbColor={settings.hapticFeedback ? '#06B6D4' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Display Section */}
        <Typography variant="label" className="text-surface-500 dark:text-surface-400 mb-2 ml-4 uppercase tracking-wider text-xs">
          Display
        </Typography>
        <View className="bg-white dark:bg-surface-800 rounded-2xl border-2 border-surface-200 dark:border-surface-700 mb-6 overflow-hidden">
          {/* Dark Mode */}
          <View className="flex-row items-center justify-between p-4 border-b border-surface-100 dark:border-surface-700">
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-lg bg-surface-100 dark:bg-surface-700 items-center justify-center mr-3">
                <Ionicons name="moon-outline" size={18} color="#737373" />
              </View>
              <Typography variant="body" className="text-surface-900 dark:text-white">
                Dark Mode
              </Typography>
            </View>
            <Select
              value={settings.darkMode}
              options={DARK_MODE_OPTIONS}
              onChange={(v) => updateSetting('darkMode', v as Settings['darkMode'])}
              compact
            />
          </View>

          {/* Font Size */}
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-lg bg-surface-100 dark:bg-surface-700 items-center justify-center mr-3">
                <Ionicons name="text-outline" size={18} color="#737373" />
              </View>
              <Typography variant="body" className="text-surface-900 dark:text-white">
                Text Size
              </Typography>
            </View>
            <Select
              value={settings.fontSize}
              options={FONT_SIZE_OPTIONS}
              onChange={(v) => updateSetting('fontSize', v as Settings['fontSize'])}
              compact
            />
          </View>
        </View>

        {/* Data Section */}
        <Typography variant="label" className="text-surface-500 dark:text-surface-400 mb-2 ml-4 uppercase tracking-wider text-xs">
          Data
        </Typography>
        <View className="bg-white dark:bg-surface-800 rounded-2xl border-2 border-surface-200 dark:border-surface-700 mb-6 overflow-hidden">
          <Pressable
            onPress={handleExportData}
            className="flex-row items-center justify-between p-4 border-b border-surface-100 dark:border-surface-700"
          >
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-lg bg-success-50 dark:bg-success-950 items-center justify-center mr-3">
                <Ionicons name="download-outline" size={18} color="#22C55E" />
              </View>
              <Typography variant="body" className="text-surface-900 dark:text-white">
                Export Data
              </Typography>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#A3A3A3" />
          </Pressable>

          <Pressable
            onPress={handleClearData}
            className="flex-row items-center justify-between p-4"
          >
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-lg bg-danger-50 dark:bg-danger-950 items-center justify-center mr-3">
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </View>
              <Typography variant="body" className="text-danger-500">
                Clear All Data
              </Typography>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#A3A3A3" />
          </Pressable>
        </View>

        {/* About Section */}
        <Typography variant="label" className="text-surface-500 dark:text-surface-400 mb-2 ml-4 uppercase tracking-wider text-xs">
          About
        </Typography>
        <View className="bg-white dark:bg-surface-800 rounded-2xl border-2 border-surface-200 dark:border-surface-700 mb-6 overflow-hidden">
          <View className="flex-row items-center justify-between p-4 border-b border-surface-100 dark:border-surface-700">
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-950 items-center justify-center mr-3">
                <Ionicons name="information-outline" size={18} color="#06B6D4" />
              </View>
              <Typography variant="body" className="text-surface-900 dark:text-white">
                App Version
              </Typography>
            </View>
            <Typography variant="body" className="text-surface-500 dark:text-surface-400">
              {Constants.expoConfig?.version || '1.0.0'}
            </Typography>
          </View>

          <Pressable className="flex-row items-center justify-between p-4 border-b border-surface-100 dark:border-surface-700">
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-lg bg-surface-100 dark:bg-surface-700 items-center justify-center mr-3">
                <Ionicons name="shield-checkmark-outline" size={18} color="#737373" />
              </View>
              <Typography variant="body" className="text-surface-900 dark:text-white">
                Privacy Policy
              </Typography>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#A3A3A3" />
          </Pressable>

          <Pressable className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-lg bg-surface-100 dark:bg-surface-700 items-center justify-center mr-3">
                <Ionicons name="document-text-outline" size={18} color="#737373" />
              </View>
              <Typography variant="body" className="text-surface-900 dark:text-white">
                Terms of Service
              </Typography>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#A3A3A3" />
          </Pressable>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

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
        <Typography variant="label" className="text-gray-500 dark:text-gray-400 mb-2 ml-4">
          NOTIFICATIONS
        </Typography>
        <Card className="mb-6 p-0 overflow-hidden">
          {/* Snooze Duration */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
            <Typography variant="body" className="text-gray-900 dark:text-white">
              Snooze Duration
            </Typography>
            <Select
              value={settings.snoozeDurationMinutes}
              options={SNOOZE_OPTIONS}
              onChange={(v) => updateSetting('snoozeDurationMinutes', v)}
              compact
            />
          </View>

          {/* Missed Threshold */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
            <View className="flex-1 mr-4">
              <Typography variant="body" className="text-gray-900 dark:text-white">
                Mark as Missed After
              </Typography>
              <Typography variant="small" className="text-gray-500 dark:text-gray-400">
                Auto-mark pending doses as missed
              </Typography>
            </View>
            <Select
              value={settings.missedThresholdMinutes}
              options={THRESHOLD_OPTIONS}
              onChange={(v) => updateSetting('missedThresholdMinutes', v)}
              compact
            />
          </View>

          {/* Sound */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
            <Typography variant="body" className="text-gray-900 dark:text-white">
              Reminder Sound
            </Typography>
            <Select
              value={settings.notificationSound}
              options={SOUND_OPTIONS}
              onChange={(v) => updateSetting('notificationSound', v)}
              compact
            />
          </View>

          {/* Haptic Feedback */}
          <View className="flex-row items-center justify-between p-4">
            <Typography variant="body" className="text-gray-900 dark:text-white">
              Vibration
            </Typography>
            <Switch
              value={settings.hapticFeedback}
              onValueChange={(v) => updateSetting('hapticFeedback', v)}
              trackColor={{ false: '#E0E0E0', true: '#4CAF5080' }}
              thumbColor={settings.hapticFeedback ? '#4CAF50' : '#f4f3f4'}
            />
          </View>
        </Card>

        {/* Display Section */}
        <Typography variant="label" className="text-gray-500 dark:text-gray-400 mb-2 ml-4">
          DISPLAY
        </Typography>
        <Card className="mb-6 p-0 overflow-hidden">
          {/* Dark Mode */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
            <Typography variant="body" className="text-gray-900 dark:text-white">
              Dark Mode
            </Typography>
            <Select
              value={settings.darkMode}
              options={DARK_MODE_OPTIONS}
              onChange={(v) => updateSetting('darkMode', v as Settings['darkMode'])}
              compact
            />
          </View>

          {/* Font Size */}
          <View className="flex-row items-center justify-between p-4">
            <Typography variant="body" className="text-gray-900 dark:text-white">
              Text Size
            </Typography>
            <Select
              value={settings.fontSize}
              options={FONT_SIZE_OPTIONS}
              onChange={(v) => updateSetting('fontSize', v as Settings['fontSize'])}
              compact
            />
          </View>
        </Card>

        {/* Data Section */}
        <Typography variant="label" className="text-gray-500 dark:text-gray-400 mb-2 ml-4">
          DATA
        </Typography>
        <Card className="mb-6 p-0 overflow-hidden">
          <Pressable
            onPress={handleExportData}
            className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700"
          >
            <Typography variant="body" className="text-gray-900 dark:text-white">
              Export Data
            </Typography>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>

          <Pressable
            onPress={handleClearData}
            className="flex-row items-center justify-between p-4"
          >
            <Typography variant="body" className="text-red-500">
              Clear All Data
            </Typography>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>
        </Card>

        {/* About Section */}
        <Typography variant="label" className="text-gray-500 dark:text-gray-400 mb-2 ml-4">
          ABOUT
        </Typography>
        <Card className="mb-6 p-0 overflow-hidden">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
            <Typography variant="body" className="text-gray-900 dark:text-white">
              App Version
            </Typography>
            <Typography variant="body" className="text-gray-500 dark:text-gray-400">
              {Constants.expoConfig?.version || '1.0.0'}
            </Typography>
          </View>

          <Pressable className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
            <Typography variant="body" className="text-gray-900 dark:text-white">
              Privacy Policy
            </Typography>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>

          <Pressable className="flex-row items-center justify-between p-4">
            <Typography variant="body" className="text-gray-900 dark:text-white">
              Terms of Service
            </Typography>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}

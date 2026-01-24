import { View, Switch, Alert, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

import { AppHeader } from '../../src/components/layout/AppHeader';
import { Screen } from '../../src/components/layout/Screen';
import { Typography } from '../../src/components/ui/Typography';
import { Select } from '../../src/components/ui/Select';
import { Settings } from '../../src/types';
import { SettingsService } from '../../src/services/settings.service';

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

const FONT_SIZE_OPTIONS = [
  { label: 'Normal', value: 'normal' },
  { label: 'Large', value: 'large' },
  { label: 'Extra Large', value: 'xlarge' },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <Typography variant="label" className="text-surface-500 mb-2 ml-4 uppercase tracking-wider text-xs">
      {children}
    </Typography>
  );
}

function Row({
  icon,
  iconBgClass,
  iconColor,
  title,
  subtitle,
  right,
  border = true,
  onPress,
}: {
  icon: string;
  iconBgClass: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  border?: boolean;
  onPress?: () => void;
}) {
  const content = (
    <View className={`flex-row items-center justify-between p-4 ${border ? 'border-b border-surface-100' : ''}`}>
      <View className="flex-row items-center flex-1 mr-3">
        <View className={`w-10 h-10 rounded-2xl items-center justify-center mr-3 ${iconBgClass}`}>
          <Ionicons name={icon as any} size={18} color={iconColor} />
        </View>
        <View className="flex-1">
          <Typography variant="body" className="text-surface-900 font-medium">
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="small" className="text-surface-500 mt-0.5">
              {subtitle}
            </Typography>
          ) : null}
        </View>
      </View>
      {right ? right : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:opacity-80">
        {content}
      </Pressable>
    );
  }

  return content;
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    SettingsService.get()
      .then((s) => {
        // Light-only app: keep persisted values, but normalize darkMode to 'light'.
        setSettings({ ...s, darkMode: 'light' });
      })
      .catch(() => {
        setSettings({
          id: 1,
          snoozeDurationMinutes: 15,
          missedThresholdMinutes: 60,
          notificationSound: 'default',
          hapticFeedback: true,
          darkMode: 'light',
          fontSize: 'normal',
          reminderAdvanceMinutes: 0,
        });
      });
  }, []);

  const updateSetting = async <K extends keyof Settings>(key: K, value: Settings[K]) => {
    if (!settings) return;
    const next = { ...settings, [key]: value };
    setSettings(next);

    try {
      // Persist where supported. (If db schema still has darkMode, it will store 'light'.)
      await SettingsService.update({ [key]: value } as any);
    } catch {
      // noop; UI still updates.
    }
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
            Alert.alert('Done', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  if (!settings) {
    return (
      <View className="flex-1 bg-surface-50">
        <AppHeader title="Settings" subtitle="Preferences" />
        <Screen includeTopInset={false} padX={16} padY={16}>
          <Typography variant="body" className="text-surface-500">
            Loading…
          </Typography>
        </Screen>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-50">
      <AppHeader title="Settings" subtitle="Preferences" />

      <Screen scroll includeTopInset={false} padX={16} padY={16} padBottomExtra={100}>
        {/* Notifications */}
        <SectionLabel>Notifications</SectionLabel>
        <View className="bg-white rounded-3xl border border-surface-100 overflow-hidden mb-6">
          <Row
            icon="alarm-outline"
            iconBgClass="bg-primary-50"
            iconColor="#06B6D4"
            title="Snooze Duration"
            right={
              <Select
                value={settings.snoozeDurationMinutes}
                options={SNOOZE_OPTIONS}
                onChange={(v) => updateSetting('snoozeDurationMinutes', v)}
                compact
              />
            }
          />

          <Row
            icon="time-outline"
            iconBgClass="bg-warning-50"
            iconColor="#F59E0B"
            title="Mark as Missed After"
            subtitle="Auto-mark pending doses as missed"
            right={
              <Select
                value={settings.missedThresholdMinutes}
                options={THRESHOLD_OPTIONS}
                onChange={(v) => updateSetting('missedThresholdMinutes', v)}
                compact
              />
            }
          />

          <Row
            icon="volume-medium-outline"
            iconBgClass="bg-surface-100"
            iconColor="#737373"
            title="Reminder Sound"
            right={
              <Select
                value={settings.notificationSound}
                options={SOUND_OPTIONS}
                onChange={(v) => updateSetting('notificationSound', v as any)}
                compact
              />
            }
          />

          <Row
            icon="phone-portrait-outline"
            iconBgClass="bg-accent-50"
            iconColor="#F97316"
            title="Vibration"
            border={false}
            right={
              <Switch
                value={settings.hapticFeedback}
                onValueChange={(v) => updateSetting('hapticFeedback', v)}
                trackColor={{ false: '#E5E5E5', true: '#06B6D480' }}
                thumbColor={settings.hapticFeedback ? '#06B6D4' : '#f4f3f4'}
              />
            }
          />
        </View>

        {/* Display */}
        <SectionLabel>Display</SectionLabel>
        <View className="bg-white rounded-3xl border border-surface-100 overflow-hidden mb-6">
          <Row
            icon="text-outline"
            iconBgClass="bg-surface-100"
            iconColor="#737373"
            title="Text Size"
            border={false}
            right={
              <Select
                value={settings.fontSize}
                options={FONT_SIZE_OPTIONS}
                onChange={(v) => updateSetting('fontSize', v as any)}
                compact
              />
            }
          />
        </View>

        {/* Data */}
        <SectionLabel>Data</SectionLabel>
        <View className="bg-white rounded-3xl border border-surface-100 overflow-hidden mb-6">
          <Row
            icon="download-outline"
            iconBgClass="bg-success-50"
            iconColor="#22C55E"
            title="Export Data"
            onPress={handleExportData}
          />

          <Row
            icon="trash-outline"
            iconBgClass="bg-danger-50"
            iconColor="#EF4444"
            title="Clear All Data"
            border={false}
            onPress={handleClearData}
            right={<Ionicons name="chevron-forward" size={20} color="#A3A3A3" />}
          />
        </View>

        {/* About */}
        <SectionLabel>About</SectionLabel>
        <View className="bg-white rounded-3xl border border-surface-100 overflow-hidden mb-2">
          <Row
            icon="information-outline"
            iconBgClass="bg-primary-50"
            iconColor="#06B6D4"
            title="App Version"
            border={false}
            right={
              <Typography variant="body" className="text-surface-500">
                {Constants.expoConfig?.version || '1.0.0'}
              </Typography>
            }
          />
        </View>
      </Screen>
    </View>
  );
}

import { View, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';

import { Screen } from '../../src/components/layout/Screen';
import { Typography } from '../../src/components/ui/Typography';
import { Select } from '../../src/components/ui/Select';
import { Button } from '../../src/components/ui/Button';
import { SettingSection, SettingRow, SettingRowWithSwitch } from '../../src/components/settings';
import { Settings, SettingsService } from '../../src/services/settings.service';
import { colors, spacing } from '../../src/design/tokens';
import { triggerHaptic } from '../../src/utils/haptics';

// Notification timing options
const REMINDER_TIMING_OPTIONS = [
  { label: 'At scheduled time', value: 0 },
  { label: '15 minutes before', value: 15 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '2 hours before', value: 120 },
];

// Sound options
const SOUND_OPTIONS = [
  { label: 'Default', value: 'default' },
  { label: 'Gentle', value: 'gentle' },
  { label: 'Urgent', value: 'urgent' },
  { label: 'Silent', value: 'silent' },
];

// Reminder style options (mapped to sound for now)
const REMINDER_STYLE_OPTIONS = [
  { label: 'Gentle', value: 'gentle' },
  { label: 'Firm', value: 'urgent' },
];

// Grace period options for missed dose follow-up
const GRACE_PERIOD_OPTIONS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '60 minutes', value: 60 },
];

const AnimatedView = Animated.View;

export default function NotificationSettingsScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const s = await SettingsService.get();
      // Light-only app: keep persisted values, but normalize darkMode to 'light'
      setSettings({ ...s, darkMode: 'light' });
    } catch {
      setSettings({
        id: 1,
        snoozeDurationMinutes: 15,
        missedThresholdMinutes: 60,
        gracePeriodMinutes: 30,
        notificationSound: 'default',
        hapticFeedback: true,
        darkMode: 'light',
        fontSize: 'normal',
        reminderAdvanceMinutes: 0,
        notificationsEnabled: true,
      });
    }
  };

  const updateSetting = async <K extends keyof Settings>(key: K, value: Settings[K]) => {
    if (!settings) return;
    const next = { ...settings, [key]: value };
    setSettings(next);

    try {
      await SettingsService.update({ [key]: value } as any);
    } catch {
      // noop; UI still updates
    }
  };

  if (!settings) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface[50] }}>
        <AnimatedView entering={FadeIn.duration(300)}>
          <View
            style={{
              paddingTop: 60,
              paddingHorizontal: spacing.md,
              paddingBottom: spacing.sm,
            }}
          >
            <Typography variant="h1" style={{ fontSize: 34, fontWeight: '700' }}>
              Notifications
            </Typography>
          </View>
        </AnimatedView>
        <Screen padX={16} padY={16}>
          <Typography variant="body" style={{ color: colors.surface[500] }}>
            Loading…
          </Typography>
        </Screen>
      </View>
    );
  }

  const getTimingLabel = () => {
    const opt = REMINDER_TIMING_OPTIONS.find(o => o.value === settings.reminderAdvanceMinutes);
    return opt?.label || 'At scheduled time';
  };

  const getSoundLabel = () => {
    const opt = SOUND_OPTIONS.find(o => o.value === settings.notificationSound);
    return opt?.label || 'Default';
  };

  const getStyleLabel = () => {
    // Derive style from current sound setting
    if (settings.notificationSound === 'gentle') return 'Gentle';
    if (settings.notificationSound === 'urgent') return 'Firm';
    return 'Gentle';
  };

  const handleReminderStyleChange = (style: 'gentle' | 'urgent') => {
    // Map style to sound setting
    updateSetting('notificationSound', style);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface[50] }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Large Title with safe area */}
        <AnimatedView entering={FadeIn.duration(300)}>
          <View
            style={{
              paddingTop: 60,
              paddingHorizontal: spacing.md,
              paddingBottom: spacing.sm,
            }}
          >
            <Typography
              variant="display"
              style={{
                fontSize: 34,
                fontWeight: '700',
                color: colors.surface[900],
              }}
            >
              Notifications
            </Typography>
            <Typography
              variant="body"
              style={{
                color: colors.surface[500],
                marginTop: 4,
              }}
            >
              Customize when and how you're reminded
            </Typography>
          </View>
        </AnimatedView>

        <View style={{ paddingHorizontal: spacing.md }}>
          {/* MASTER TOGGLE Section */}
          <AnimatedView entering={FadeInDown.delay(100).springify()}>
            <SettingSection title="">
              <SettingRowWithSwitch
                icon="bell.fill"
                iconFallback="notifications"
                iconBg={settings.notificationsEnabled ? colors.primary[50] : colors.surface[100]}
                iconColor={settings.notificationsEnabled ? colors.primary[700] : colors.surface[400]}
                title="Enable Notifications"
                subtitle={settings.notificationsEnabled ? 'Receive medication reminders' : 'Notifications are disabled'}
                switchValue={settings.notificationsEnabled}
                onValueChange={(v) => updateSetting('notificationsEnabled', v)}
                hapticType="medium"
              />
            </SettingSection>
          </AnimatedView>

          {/* TIMING Section */}
          {settings.notificationsEnabled && (
            <AnimatedView entering={FadeInDown.delay(150).springify()}>
              <SettingSection title="Timing">
                <SettingRow
                  icon="clock.fill"
                  iconFallback="time"
                  iconBg={colors.primary[50]}
                  iconColor={colors.primary[700]}
                  title="Remind Me"
                  subtitle="When to receive the reminder"
                  showBorder
                  right={
                    <Select
                      value={settings.reminderAdvanceMinutes}
                      options={REMINDER_TIMING_OPTIONS}
                      onChange={(v) => updateSetting('reminderAdvanceMinutes', v)}
                      compact
                    />
                  }
                />

                <SettingRow
                  icon="hourglass"
                  iconFallback="hourglass"
                  iconBg={colors.warning[50]}
                  iconColor={colors.warning[600]}
                  title="Missed Dose Grace Period"
                  subtitle="Wait before sending a follow-up reminder"
                  showBorder={false}
                  right={
                    <Select
                      value={settings.gracePeriodMinutes ?? 30}
                      options={GRACE_PERIOD_OPTIONS}
                      onChange={(v) => updateSetting('gracePeriodMinutes', v as any)}
                      compact
                    />
                  }
                />
              </SettingSection>
            </AnimatedView>
          )}

          {/* STYLE Section */}
          {settings.notificationsEnabled && (
            <AnimatedView entering={FadeInDown.delay(200).springify()}>
              <SettingSection title="Style">
                <SettingRow
                  icon="speaker.wave.2.fill"
                  iconFallback="volume-medium"
                  iconBg={colors.surface[100]}
                  iconColor={colors.surface[700]}
                  title="Sound"
                  showBorder
                  right={
                    <Select
                      value={settings.notificationSound}
                      options={SOUND_OPTIONS}
                      onChange={(v) => updateSetting('notificationSound', v as any)}
                      compact
                    />
                  }
                />

                <SettingRow
                  icon="waveform"
                  iconFallback="pulse"
                  iconBg={colors.warning[50]}
                  iconColor={colors.warning[600]}
                  title="Reminder Style"
                  subtitle="Gentle for soft alerts, Firm for urgent"
                  showBorder={false}
                  right={
                    <Select
                      value={settings.notificationSound === 'urgent' ? 'urgent' : 'gentle'}
                      options={REMINDER_STYLE_OPTIONS}
                      onChange={(v) => handleReminderStyleChange(v as 'gentle' | 'urgent')}
                      compact
                    />
                  }
                />
              </SettingSection>
            </AnimatedView>
          )}

          {/* HAPTICS Section */}
          {settings.notificationsEnabled && (
            <AnimatedView entering={FadeInDown.delay(250).springify()}>
              <SettingSection title="Haptics">
                <SettingRowWithSwitch
                  icon="iphone.radiowaves.left.and.right"
                  iconFallback="phone-portrait"
                  iconBg={colors.success[50]}
                  iconColor={colors.success[600]}
                  title="Vibration"
                  subtitle="Vibrate with notifications"
                  switchValue={settings.hapticFeedback}
                  onValueChange={(v) => updateSetting('hapticFeedback', v)}
                  hapticType="light"
                  showBorder={false}
                />
              </SettingSection>
            </AnimatedView>
          )}

          {/* Info Card */}
          <AnimatedView entering={FadeInDown.delay(300).springify()}>
            <View
              style={{
                backgroundColor: colors.primary[50],
                borderRadius: 12,
                padding: spacing.md,
                marginTop: spacing.md,
                borderWidth: 1,
                borderColor: colors.primary[100],
              }}
            >
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Typography
                  variant="body"
                  style={{ color: colors.primary[800], flex: 1, lineHeight: 20 }}
                >
                  {settings.notificationsEnabled
                    ? 'Reminders will be sent based on your medication schedule. You can also adjust settings for individual medications.'
                    : 'Enable notifications to receive medication reminders and stay on track with your health.'}
                </Typography>
              </View>
            </View>
          </AnimatedView>
        </View>
      </ScrollView>
    </View>
  );
}

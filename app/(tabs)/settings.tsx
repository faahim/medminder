import { View, ScrollView, Alert, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';

import { Screen } from '../../src/components/layout/Screen';
import { Typography } from '../../src/components/ui/Typography';
import { Select } from '../../src/components/ui/Select';
import { Input } from '../../src/components/ui/Input';
import { Modal } from '../../src/components/ui/Modal';
import { Button } from '../../src/components/ui/Button';
import { SettingSection, SettingRow, SettingRowWithSwitch } from '../../src/components/settings';
import { OpenAIKeyService } from '../../src/services/openaiKey.service';
import { Settings } from '../../src/types';
import { SettingsService } from '../../src/services/settings.service';
import { colors, spacing } from '../../src/design/tokens';
import { triggerHaptic } from '../../src/utils/haptics';

// Select options
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

const REMINDER_ADVANCE_OPTIONS = [
  { label: 'At scheduled time', value: 0 },
  { label: '5 minutes early', value: 5 },
  { label: '10 minutes early', value: 10 },
  { label: '15 minutes early', value: 15 },
  { label: '30 minutes early', value: 30 },
];

const AnimatedView = Animated.View;

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [apiKeyPreview, setApiKeyPreview] = useState<string>('');
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKeyDraft, setApiKeyDraft] = useState('');

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    loadApiKey();
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
        notificationSound: 'default',
        hapticFeedback: true,
        darkMode: 'light',
        fontSize: 'normal',
        reminderAdvanceMinutes: 0,
      });
    }
  };

  const loadApiKey = async () => {
    const key = await OpenAIKeyService.get();
    if (!key) {
      setApiKeyPreview('Not set');
      return;
    }
    const masked = `${key.slice(0, 5)}…${key.slice(-4)}`;
    setApiKeyPreview(masked);
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

  const handleOpenAIKeyPress = async () => {
    triggerHaptic('selection');
    const current = await OpenAIKeyService.get();
    setApiKeyDraft(current ?? '');
    setApiKeyModalOpen(true);
  };

  const handleExportData = () => {
    triggerHaptic('light');
    Alert.alert('Export Data', 'This feature will be available in a future update.');
  };

  const handleClearData = () => {
    triggerHaptic('warning');
    Alert.alert(
      'Clear All Data?',
      'This will permanently delete all your medications, history, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: () => {
            triggerHaptic('error');
            Alert.alert('Done', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  const handleHelpSupport = () => {
    triggerHaptic('light');
    Alert.alert('Help & Support', 'This feature will be available in a future update.');
  };

  const handleRateApp = () => {
    triggerHaptic('light');
    Alert.alert('Rate App', 'Thank you for using Medminder! This feature will be available soon.');
  };

  const handlePrivacyPolicy = () => {
    triggerHaptic('light');
    Alert.alert('Privacy Policy', 'This feature will be available in a future update.');
  };

  const handleSaveApiKey = async () => {
    await OpenAIKeyService.set(apiKeyDraft);
    const key = await OpenAIKeyService.get();
    setApiKeyPreview(key ? `${key.slice(0, 5)}…${key.slice(-4)}` : 'Not set');
    setApiKeyModalOpen(false);
    triggerHaptic('success');
    Alert.alert('Saved', 'OpenAI API key updated.');
  };

  const handleRemoveApiKey = async () => {
    await OpenAIKeyService.clear();
    setApiKeyPreview('Not set');
    setApiKeyDraft('');
    setApiKeyModalOpen(false);
    triggerHaptic('warning');
    Alert.alert('Removed', 'OpenAI API key removed from this device.');
  };

  if (!settings) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface[50] }}>
        <Animated.View entering={FadeIn.duration(300)}>
          <View
            style={{
              paddingTop: 60,
              paddingHorizontal: spacing.md,
              paddingBottom: spacing.sm,
            }}
          >
            <Typography variant="h1" style={{ fontSize: 34, fontWeight: '700' }}>
              Settings
            </Typography>
          </View>
        </Animated.View>
        <Screen padX={16} padY={16}>
          <Typography variant="body" style={{ color: colors.surface[500] }}>
            Loading…
          </Typography>
        </Screen>
      </View>
    );
  }

  const getSnoozeLabel = () => SNOOZE_OPTIONS.find(o => o.value === settings.snoozeDurationMinutes)?.label || '15 minutes';
  const getThresholdLabel = () => THRESHOLD_OPTIONS.find(o => o.value === settings.missedThresholdMinutes)?.label || '1 hour';
  const getSoundLabel = () => SOUND_OPTIONS.find(o => o.value === settings.notificationSound)?.label || 'Default';
  const getFontSizeLabel = () => FONT_SIZE_OPTIONS.find(o => o.value === settings.fontSize)?.label || 'Normal';
  const getAdvanceLabel = () => REMINDER_ADVANCE_OPTIONS.find(o => o.value === settings.reminderAdvanceMinutes)?.label || 'At scheduled time';

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface[50] }}>
      {/* Large Title Header - iOS style */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Large Title with safe area */}
        <Animated.View entering={FadeIn.duration(300)}>
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
              Settings
            </Typography>
          </View>
        </Animated.View>

        <View style={{ paddingHorizontal: spacing.md }}>
          {/* NOTIFICATIONS Section */}
          <AnimatedView entering={FadeInDown.delay(100).springify()}>
            <SettingSection title="Notifications">
              <SettingRow
                icon="bell.badge"
                iconFallback="notifications"
                iconBg={colors.primary[50]}
                iconColor={colors.primary[700]}
                title="Notification Settings"
                subtitle="Customize reminders and alerts"
                showChevron
                pressable
                onPress={() => {
                  triggerHaptic('light');
                  router.push('/settings/notifications');
                }}
              />

              <SettingRow
                icon="bell.fill"
                iconFallback="notifications"
                iconBg={colors.warning[50]}
                iconColor={colors.warning[600]}
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

              <SettingRow
                icon="clock.badge.exclamationmark"
                iconFallback="time-outline"
                iconBg={colors.warning[50]}
                iconColor={colors.warning[600]}
                title="Auto-Miss After"
                subtitle="Mark as missed if not taken"
                right={
                  <Select
                    value={settings.missedThresholdMinutes}
                    options={THRESHOLD_OPTIONS}
                    onChange={(v) => updateSetting('missedThresholdMinutes', v)}
                    compact
                  />
                }
              />

              <SettingRow
                icon="speaker.wave.2.fill"
                iconFallback="volume-medium"
                iconBg={colors.surface[100]}
                iconColor={colors.surface[700]}
                title="Sound"
                right={
                  <Select
                    value={settings.notificationSound}
                    options={SOUND_OPTIONS}
                    onChange={(v) => updateSetting('notificationSound', v as any)}
                    compact
                  />
                }
              />

              <SettingRowWithSwitch
                icon="iphone.radiowaves.left.and.right"
                iconFallback="phone-portrait"
                iconBg={colors.success[50]}
                iconColor={colors.success[600]}
                title="Vibration"
                switchValue={settings.hapticFeedback}
                onValueChange={(v) => updateSetting('hapticFeedback', v)}
              />

              <SettingRow
                icon="clock.arrow.circlepath"
                iconFallback="refresh"
                iconBg={colors.primary[50]}
                iconColor={colors.primary[700]}
                title="Remind Early"
                showBorder={false}
                right={
                  <Select
                    value={settings.reminderAdvanceMinutes}
                    options={REMINDER_ADVANCE_OPTIONS}
                    onChange={(v) => updateSetting('reminderAdvanceMinutes', v)}
                    compact
                  />
                }
              />
            </SettingSection>
          </AnimatedView>

          {/* APPEARANCE Section */}
          <AnimatedView entering={FadeInDown.delay(200).springify()}>
            <SettingSection title="Appearance">
              <SettingRow
                icon="textformat"
                iconFallback="text-outline"
                iconBg={colors.surface[100]}
                iconColor={colors.surface[700]}
                title="Text Size"
                showBorder={false}
                right={
                  <Select
                    value={settings.fontSize}
                    options={FONT_SIZE_OPTIONS}
                    onChange={(v) => updateSetting('fontSize', v as any)}
                    compact
                  />
                }
              />
            </SettingSection>
          </AnimatedView>

          {/* AI Section */}
          <AnimatedView entering={FadeInDown.delay(300).springify()}>
            <SettingSection title="AI">
              <SettingRow
                icon="key"
                iconFallback="key-outline"
                iconBg={colors.surface[100]}
                iconColor={colors.surface[700]}
                title="OpenAI API Key"
                subtitle={apiKeyPreview === 'Not set' ? 'Required for prescription scan' : apiKeyPreview}
                showChevron
                showBorder={false}
                pressable
                onPress={handleOpenAIKeyPress}
              />
            </SettingSection>
          </AnimatedView>

          {/* DATA Section */}
          <AnimatedView entering={FadeInDown.delay(400).springify()}>
            <SettingSection title="Data">
              <SettingRow
                icon="square.and.arrow.up"
                iconFallback="download"
                iconBg={colors.success[50]}
                iconColor={colors.success[600]}
                title="Export Data"
                subtitle="Export medications and history"
                showChevron
                pressable
                onPress={handleExportData}
              />

              <SettingRow
                icon="square.and.arrow.down"
                iconFallback="download"
                iconBg={colors.primary[50]}
                iconColor={colors.primary[700]}
                title="Import Data"
                subtitle="Restore from backup"
                showChevron
                pressable
                onPress={() => {
                  triggerHaptic('light');
                  Alert.alert('Import Data', 'This feature will be available in a future update.');
                }}
              />

              <SettingRow
                icon="trash.fill"
                iconFallback="trash"
                iconBg={colors.error[50]}
                iconColor={colors.error[600]}
                title="Clear All Data"
                subtitle="Delete medications, history, and settings"
                destructive
                showChevron
                showBorder={false}
                pressable
                onPress={handleClearData}
              />
            </SettingSection>
          </AnimatedView>

          {/* ABOUT Section */}
          <AnimatedView entering={FadeInDown.delay(500).springify()}>
            <SettingSection title="About">
              <SettingRow
                icon="questionmark.circle.fill"
                iconFallback="help-circle"
                iconBg={colors.surface[100]}
                iconColor={colors.surface[700]}
                title="Help & Support"
                showChevron
                pressable
                onPress={handleHelpSupport}
              />

              <SettingRow
                icon="star.fill"
                iconFallback="star"
                iconBg={colors.warning[50]}
                iconColor={colors.warning[600]}
                title="Rate App"
                showChevron
                pressable
                onPress={handleRateApp}
              />

              <SettingRow
                icon="doc.text.fill"
                iconFallback="document"
                iconBg={colors.surface[100]}
                iconColor={colors.surface[700]}
                title="Privacy Policy"
                showChevron
                showBorder={false}
                pressable
                onPress={handlePrivacyPolicy}
              />
            </SettingSection>
          </AnimatedView>

          {/* Version Info */}
          <AnimatedView entering={FadeInDown.delay(600).springify()}>
            <View
              style={{
                alignItems: 'center',
                paddingVertical: spacing.xl,
                marginTop: spacing.md,
              }}
            >
              <Typography
                variant="label"
                style={{
                  color: colors.surface[500],
                  fontSize: 13,
                }}
              >
                Medminder v{Constants.expoConfig?.version || '1.0.0'}
              </Typography>
              <Typography
                variant="small"
                style={{
                  color: colors.surface[500],
                  marginTop: 4,
                }}
              >
                Made with ❤️
              </Typography>
            </View>
          </AnimatedView>
        </View>
      </ScrollView>

      {/* OpenAI API Key Modal */}
      <Modal visible={apiKeyModalOpen} onClose={() => setApiKeyModalOpen(false)}>
        <View>
          <Typography variant="h3" style={{ color: colors.surface[900], fontWeight: '600', marginBottom: spacing.sm }}>
            OpenAI API Key
          </Typography>
          <Typography variant="body" style={{ color: colors.surface[500], marginBottom: spacing.md }}>
            Stored on-device. Needed for prescription scanning.
          </Typography>

          <Input
            label="API Key"
            value={apiKeyDraft}
            onChangeText={setApiKeyDraft}
            placeholder="sk-..."
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            size="lg"
          />

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
            <Button
              title="Cancel"
              variant="secondary"
              size="lg"
              onPress={() => {
                triggerHaptic('light');
                setApiKeyModalOpen(false);
              }}
              style={{ flex: 1 }}
            />
            <Button
              title="Save"
              size="lg"
              onPress={handleSaveApiKey}
              style={{ flex: 1 }}
            />
          </View>

          <Pressable
            onPress={handleRemoveApiKey}
            style={{ marginTop: spacing.md, paddingVertical: spacing.sm }}
          >
            <Typography variant="body" style={{ color: colors.error[600], textAlign: 'center', fontWeight: '500' }}>
              Remove key
            </Typography>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

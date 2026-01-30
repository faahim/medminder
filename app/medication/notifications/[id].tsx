import { View, Pressable } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';

import { MedicationService } from '../../../src/services/medication.service';
import { Medication, NotificationSound, MedicationNotificationSettings } from '../../../src/types';
import { Screen } from '../../../src/components/layout/Screen';
import { Typography } from '../../../src/components/ui/Typography';
import { Button } from '../../../src/components/ui/Button';
import { Icon } from '../../../src/components/ui/Icon';
import { colors } from '../../../src/design/tokens';

const NOTIFICATION_SOUND_OPTIONS = [
  { label: 'Default', value: 'default' as NotificationSound, description: 'Standard system sound' },
  { label: 'Gentle', value: 'gentle' as NotificationSound, description: 'Softer, quieter sound' },
  { label: 'Urgent', value: 'urgent' as NotificationSound, description: 'Louder, more attention-grabbing' },
] as const;

const LEAD_TIME_OPTIONS = [
  { label: 'None', value: 0, description: 'No advance reminder' },
  { label: '5 minutes before', value: 5 },
  { label: '10 minutes before', value: 10 },
  { label: '15 minutes before', value: 15 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
] as const;

export default function MedicationNotificationSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [medication, setMedication] = useState<Medication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Notification settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationSound, setNotificationSound] = useState<NotificationSound>('default');
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [reminderAdvanceMinutes, setReminderAdvanceMinutes] = useState(0);

  useEffect(() => {
    loadMedication();
  }, [id]);

  const loadMedication = async () => {
    if (!id) {
      router.back();
      return;
    }

    try {
      const med = await MedicationService.getById(id);
      if (!med) {
        Alert.alert('Error', 'Medication not found');
        router.back();
        return;
      }

      setMedication(med);
      setNotificationsEnabled(med.notificationsEnabled ?? true);
      setNotificationSound(med.notificationSound ?? 'default');
      setVibrationEnabled(med.vibrationEnabled ?? true);
      setReminderAdvanceMinutes(med.reminderAdvanceMinutes ?? 0);
    } catch (error) {
      console.error('Error loading medication:', error);
      Alert.alert('Error', 'Failed to load medication');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setIsSaving(true);
    try {
      const settings: Partial<MedicationNotificationSettings> = {
        notificationsEnabled,
        notificationSound,
        vibrationEnabled,
        reminderAdvanceMinutes,
      };

      await MedicationService.updateNotificationSettings(medication!.id, settings);
      Alert.alert('Success', 'Notification settings saved', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Screen scroll padX={16} padY={16}>
        <View className="flex-1 items-center justify-center py-20">
          <Typography variant="body">Loading medication…</Typography>
        </View>
      </Screen>
    );
  }

  return (
    <View className="flex-1 bg-surface-50">
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Notification Settings',
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: colors.primary[500],
          headerTitleStyle: { fontWeight: '600', color: colors.surface[900] },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Icon
                name="chevron.left"
                fallback="arrow-back"
                size={24}
                color={colors.surface[900]}
              />
            </Pressable>
          ),
        }}
      />

      <Screen scroll padX={16} padY={16} padBottomExtra={100}>
        {/* Medication Name */}
        <View className="mb-5">
          <View className="bg-primary-50 border border-primary-100 rounded-2xl p-4 flex-row items-center">
            <View
              className="w-12 h-12 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: medication?.color || colors.primary[500] }}
            >
              <Icon name="pill" fallback="medkit" size={24} color="#fff" />
            </View>
            <View className="flex-1">
              <Typography variant="h3" className="text-surface-900">
                {medication?.name}
              </Typography>
              <Typography variant="small" className="text-surface-600">
                {medication?.dosage} {medication?.dosageUnit}
              </Typography>
            </View>
          </View>
        </View>

        {/* Enable Notifications */}
        <View className="mb-5">
          <Typography variant="label" className="text-surface-500 mb-2 ml-1 uppercase tracking-wider text-xs">
            Notifications
          </Typography>
          <View className="bg-white rounded-3xl border border-surface-100 overflow-hidden">
            <Pressable
              onPress={() => setNotificationsEnabled(!notificationsEnabled)}
              className="flex-row items-center justify-between p-4"
            >
              <View className="flex-1">
                <Typography variant="body" className="text-surface-900 font-medium">
                  Enable Notifications
                </Typography>
                <Typography variant="small" className="text-surface-500">
                  {notificationsEnabled
                    ? 'You will receive reminders for this medication'
                    : 'No reminders will be sent for this medication'}
                </Typography>
              </View>
              <View
                className={`w-13 h-8 rounded-full p-1 transition-colors ${
                  notificationsEnabled ? 'bg-primary-500' : 'bg-surface-300'
                }`}
              >
                <View
                  className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${
                    notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </View>
            </Pressable>
          </View>
        </View>

        {notificationsEnabled && (
          <>
            {/* Notification Sound */}
            <View className="mb-5">
              <Typography variant="label" className="text-surface-500 mb-2 ml-1 uppercase tracking-wider text-xs">
                Sound
              </Typography>
              <View className="bg-white rounded-3xl border border-surface-100 overflow-hidden">
                {NOTIFICATION_SOUND_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setNotificationSound(option.value);
                    }}
                    className={`flex-row items-center justify-between p-4 ${
                      option !== NOTIFICATION_SOUND_OPTIONS[NOTIFICATION_SOUND_OPTIONS.length - 1]
                        ? 'border-b border-surface-100'
                        : ''
                    }`}
                  >
                    <View className="flex-1">
                      <Typography variant="body" className="text-surface-900 font-medium">
                        {option.label}
                      </Typography>
                      {option.description && (
                        <Typography variant="small" className="text-surface-500">
                          {option.description}
                        </Typography>
                      )}
                    </View>
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        notificationSound === option.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-surface-300'
                      }`}
                    >
                      {notificationSound === option.value && (
                        <Icon name="checkmark" fallback="checkmark" size={14} color={colors.primary[600]} />
                      )}
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Vibration */}
            <View className="mb-5">
              <Typography variant="label" className="text-surface-500 mb-2 ml-1 uppercase tracking-wider text-xs">
                Haptics
              </Typography>
              <View className="bg-white rounded-3xl border border-surface-100 overflow-hidden">
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setVibrationEnabled(!vibrationEnabled);
                  }}
                  className="flex-row items-center justify-between p-4"
                >
                  <View className="flex-1">
                    <Typography variant="body" className="text-surface-900 font-medium">
                      Vibration
                    </Typography>
                    <Typography variant="small" className="text-surface-500">
                      {vibrationEnabled
                        ? 'Your device will vibrate with notifications'
                        : 'No vibration with notifications'}
                    </Typography>
                  </View>
                  <View
                    className={`w-13 h-8 rounded-full p-1 transition-colors ${
                      vibrationEnabled ? 'bg-primary-500' : 'bg-surface-300'
                    }`}
                  >
                    <View
                      className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${
                        vibrationEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </View>
                </Pressable>
              </View>
            </View>

            {/* Reminder Lead Time */}
            <View className="mb-6">
              <Typography variant="label" className="text-surface-500 mb-2 ml-1 uppercase tracking-wider text-xs">
                Advance Reminder
              </Typography>
              <View className="bg-white rounded-3xl border border-surface-100 overflow-hidden">
                {LEAD_TIME_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setReminderAdvanceMinutes(option.value);
                    }}
                    className={`flex-row items-center justify-between p-4 ${
                      option !== LEAD_TIME_OPTIONS[LEAD_TIME_OPTIONS.length - 1]
                        ? 'border-b border-surface-100'
                        : ''
                    }`}
                  >
                    <View className="flex-1">
                      <Typography variant="body" className="text-surface-900 font-medium">
                        {option.label}
                      </Typography>
                      {option.description && (
                        <Typography variant="small" className="text-surface-500">
                          {option.description}
                        </Typography>
                      )}
                    </View>
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        reminderAdvanceMinutes === option.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-surface-300'
                      }`}
                    >
                      {reminderAdvanceMinutes === option.value && (
                        <Icon name="checkmark" fallback="checkmark" size={14} color={colors.primary[600]} />
                      )}
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        )}
      </Screen>

      {/* Save Button Footer */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-surface-100 p-4 pb-8">
        <Button
          title="Save Settings"
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleSave}
          loading={isSaving}
          leftIcon={<Icon name="checkmark" fallback="checkmark-circle" size={18} color="#fff" />}
        />
      </View>
    </View>
  );
}

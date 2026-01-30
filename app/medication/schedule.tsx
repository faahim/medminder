import { View, Pressable } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMedicationForm } from '../../src/contexts/MedicationFormContext';
import { Screen } from '../../src/components/layout/Screen';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Input } from '../../src/components/ui/Input';
import { Icon } from '../../src/components/ui/Icon';
import { ScheduleType } from '../../src/types';

interface ScheduleOption {
  value: ScheduleType;
  label: string;
  description: string;
  sfSymbol: string;
  fallbackIcon: string;
  iconColor: string;
  chipBg: string;
}

const SCHEDULE_OPTIONS: ScheduleOption[] = [
  { value: 'daily', label: 'Daily', description: 'Same times every day', sfSymbol: 'calendar', fallbackIcon: 'calendar', iconColor: '#06B6D4', chipBg: 'bg-primary-100' },
  { value: 'weekly', label: 'Weekly', description: 'Specific days of the week', sfSymbol: 'calendar', fallbackIcon: 'calendar', iconColor: '#8B5CF6', chipBg: 'bg-surface-100' },
  { value: 'interval', label: 'Every X Hours', description: 'Fixed interval throughout the day', sfSymbol: 'clock', fallbackIcon: 'time', iconColor: '#F59E0B', chipBg: 'bg-surface-100' },
  { value: 'as-needed', label: 'As Needed (PRN)', description: 'No scheduled reminders', sfSymbol: 'bolt', fallbackIcon: 'flash', iconColor: '#F97316', chipBg: 'bg-accent-100' },
];

const COMMON_SCHEDULES = [
  { label: 'Once daily', times: ['08:00'], icon: '1' },
  { label: 'Twice daily', times: ['08:00', '20:00'], icon: '2' },
  { label: '3× daily', times: ['08:00', '14:00', '20:00'], icon: '3' },
  { label: '4× daily', times: ['08:00', '12:00', '16:00', '20:00'], icon: '4' },
];

export default function AddMedicationStep2() {
  const insets = useSafeAreaInsets();
  const { formData, updateFormData } = useMedicationForm();
  const [showCustomTimes, setShowCustomTimes] = useState(false);

  const handleAddTime = () => updateFormData({ scheduleTimes: [...formData.scheduleTimes, '12:00'] });
  const handleRemoveTime = (index: number) => updateFormData({ scheduleTimes: formData.scheduleTimes.filter((_, i) => i !== index) });
  const handleTimeChange = (index: number, time: string) => {
    const next = [...formData.scheduleTimes];
    next[index] = time;
    updateFormData({ scheduleTimes: next });
  };

  const handleQuickSelect = (times: string[]) => {
    updateFormData({ scheduleTimes: times });
    setShowCustomTimes(false);
  };

  const handleScheduleTypeChange = (type: ScheduleType) => {
    updateFormData({ scheduleType: type });
    if (type === 'as-needed') {
      updateFormData({ scheduleTimes: [] });
    } else if (formData.scheduleTimes.length === 0) {
      updateFormData({ scheduleTimes: ['08:00'] });
    }
  };

  const canProceed = formData.scheduleType === 'as-needed' || formData.scheduleTimes.length > 0;

  return (
    <View className="flex-1 bg-surface-50">
      <ProgressBar current={2} total={5} />

      <Screen scroll keyboardAvoiding includeTopInset={false} padX={16} padY={16} padBottomExtra={160}>
        <Typography variant="h2" className="text-surface-900 mb-1">
          Schedule
        </Typography>
        <Typography variant="body" className="text-surface-500 mb-6">
          Step 2 of 5 · When do you take it?
        </Typography>

        <View className="bg-white rounded-3xl border border-surface-100 p-5">
          <Typography variant="label" className="text-surface-600 mb-3 uppercase tracking-wider text-xs">
            Frequency type
          </Typography>

          <View className="gap-3">
            {SCHEDULE_OPTIONS.map((option) => {
              const selected = formData.scheduleType === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => handleScheduleTypeChange(option.value)}
                  className={`flex-row items-center p-4 rounded-2xl border ${selected ? 'border-primary-500 bg-primary-50' : 'border-surface-100 bg-white'}`}
                >
                  <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${option.chipBg}`}>
                    <Icon name={option.sfSymbol} fallback={option.fallbackIcon} size={22} color={option.iconColor} />
                  </View>
                  <View className="flex-1">
                    <Typography variant="body" className={`font-semibold ${selected ? 'text-primary-700' : 'text-surface-900'}`}>
                      {option.label}
                    </Typography>
                    <Typography variant="small" className="text-surface-500">
                      {option.description}
                    </Typography>
                  </View>
                  {selected ? (
                    <View className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center">
                      <Icon name="checkmark" fallback="check" size={16} color="#fff" />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          {formData.scheduleType === 'as-needed' ? (
            <View className="mt-5 bg-accent-50 rounded-2xl p-4 border border-accent-100">
              <View className="flex-row items-start">
                <View className="w-10 h-10 rounded-2xl bg-accent-100 items-center justify-center mr-3">
                  <Icon name="info.circle" fallback="info" size={22} color="#F97316" />
                </View>
                <View className="flex-1">
                  <Typography variant="body" className="text-surface-900 font-semibold mb-1">
                    As-needed medication
                  </Typography>
                  <Typography variant="small" className="text-surface-600">
                    No scheduled reminders. You can log doses anytime.
                  </Typography>
                </View>
              </View>
            </View>
          ) : null}

          {(formData.scheduleType === 'daily' || formData.scheduleType === 'weekly') && !showCustomTimes ? (
            <View className="mt-6">
              <Typography variant="label" className="text-surface-600 mb-3 uppercase tracking-wider text-xs">
                Quick select
              </Typography>
              <View className="gap-2">
                {COMMON_SCHEDULES.map((schedule) => {
                  const selected = JSON.stringify(formData.scheduleTimes) === JSON.stringify(schedule.times);
                  return (
                    <Pressable
                      key={schedule.label}
                      onPress={() => handleQuickSelect(schedule.times)}
                      className={`flex-row items-center p-4 rounded-2xl ${selected ? 'bg-primary-100 border border-primary-200' : 'bg-surface-100'}`}
                    >
                      <View className={`w-9 h-9 rounded-xl items-center justify-center mr-3 ${selected ? 'bg-primary-500' : 'bg-white'}`}>
                        <Typography variant="body" className={`font-bold ${selected ? 'text-white' : 'text-surface-700'}`}>
                          {schedule.icon}
                        </Typography>
                      </View>
                      <View className="flex-1">
                        <Typography variant="body" className={`font-medium ${selected ? 'text-primary-700' : 'text-surface-900'}`}>
                          {schedule.label}
                        </Typography>
                        <Typography variant="small" className="text-surface-500">
                          {schedule.times.join(' • ')}
                        </Typography>
                      </View>
                      {selected ? <Icon name="checkmark.circle" fallback="check-circle" size={22} color="#06B6D4" /> : null}
                    </Pressable>
                  );
                })}
              </View>

              <Pressable onPress={() => setShowCustomTimes(true)} className="py-3 mt-2">
                <Typography variant="body" className="text-primary-700 font-medium text-center">
                  Set custom times…
                </Typography>
              </Pressable>
            </View>
          ) : null}

          {showCustomTimes && formData.scheduleType !== 'as-needed' ? (
            <View className="mt-6">
              <View className="flex-row items-center justify-between mb-3">
                <Typography variant="label" className="text-surface-600 uppercase tracking-wider text-xs">
                  Custom times
                </Typography>
                <Pressable onPress={() => setShowCustomTimes(false)}>
                  <Typography variant="small" className="text-primary-700 font-medium">
                    Back to presets
                  </Typography>
                </Pressable>
              </View>

              {formData.scheduleTimes.map((time, index) => (
                <View key={index} className="flex-row items-center mb-3">
                  <View className="flex-1">
                    <Input
                      value={time}
                      onChangeText={(t) => handleTimeChange(index, t)}
                      placeholder="08:00"
                      keyboardType="number-pad"
                      size="lg"
                    />
                  </View>
                  {formData.scheduleTimes.length > 1 ? (
                    <Pressable
                      onPress={() => handleRemoveTime(index)}
                      className="ml-3 w-12 h-12 rounded-2xl bg-danger-50 items-center justify-center"
                      accessibilityLabel="Remove time"
                    >
                      <Icon name="trash" fallback="delete" size={20} color="#EF4444" />
                    </Pressable>
                  ) : null}
                </View>
              ))}

              <Pressable
                onPress={handleAddTime}
                className="flex-row items-center justify-center py-4 rounded-2xl border border-dashed border-surface-300"
              >
                <Icon name="plus.circle" fallback="add-circle" size={20} color="#06B6D4" />
                <Typography variant="body" className="text-primary-700 ml-2 font-medium">
                  Add another time
                </Typography>
              </Pressable>
            </View>
          ) : null}

          {formData.scheduleType === 'interval' ? (
            <View className="mt-6">
              <Typography variant="label" className="text-surface-600 mb-2 uppercase tracking-wider text-xs">
                Interval
              </Typography>
              <View className="bg-surface-100 rounded-2xl p-4">
                <Typography variant="body" className="text-surface-700 mb-3">
                  Take every:
                </Typography>
                <View className="flex-row items-center">
                  <Input
                    value={String(formData.scheduleIntervalHours)}
                    onChangeText={(text) => updateFormData({ scheduleIntervalHours: parseInt(text) || 6 })}
                    placeholder="6"
                    keyboardType="number-pad"
                    size="lg"
                    className="w-24"
                  />
                  <Typography variant="body" className="text-surface-600 ml-3">
                    hours
                  </Typography>
                </View>
              </View>
            </View>
          ) : null}
        </View>
      </Screen>

      <View className="px-6 pt-4 bg-white border-t border-surface-100" style={{ paddingBottom: insets.bottom + 16 }}>
        <View className="flex-row gap-3">
          <Button title="Back" variant="secondary" size="lg" onPress={() => router.back()} className="flex-1" />
          <Button title="Next" size="lg" onPress={() => router.push('/medication/meal')} disabled={!canProceed} className="flex-1" />
        </View>
      </View>
    </View>
  );
}

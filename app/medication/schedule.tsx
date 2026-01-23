import { View, ScrollView, Pressable } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useMedicationForm } from '../../src/contexts/MedicationFormContext';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Input } from '../../src/components/ui/Input';
import { Ionicons } from '@expo/vector-icons';
import { ScheduleType } from '../../src/types';

interface ScheduleOption {
  value: ScheduleType;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  bgColor: string;
}

const SCHEDULE_OPTIONS: ScheduleOption[] = [
  {
    value: 'daily',
    label: 'Daily',
    description: 'Same times every day',
    icon: 'calendar',
    iconColor: '#06B6D4',
    bgColor: 'bg-primary-50 dark:bg-primary-950',
  },
  {
    value: 'weekly',
    label: 'Weekly',
    description: 'Specific days of the week',
    icon: 'calendar-outline',
    iconColor: '#8B5CF6',
    bgColor: 'bg-violet-50 dark:bg-violet-950',
  },
  {
    value: 'interval',
    label: 'Every X Hours',
    description: 'Fixed interval throughout the day',
    icon: 'time-outline',
    iconColor: '#F59E0B',
    bgColor: 'bg-amber-50 dark:bg-amber-950',
  },
  {
    value: 'as-needed',
    label: 'As Needed (PRN)',
    description: 'Take only when required',
    icon: 'flash-outline',
    iconColor: '#F97316',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
  },
];

const COMMON_SCHEDULES = [
  { label: 'Once daily', times: ['08:00'], icon: '1' },
  { label: 'Twice daily', times: ['08:00', '20:00'], icon: '2' },
  { label: 'Three times daily', times: ['08:00', '14:00', '20:00'], icon: '3' },
  { label: 'Four times daily', times: ['08:00', '12:00', '16:00', '20:00'], icon: '4' },
];

export default function AddMedicationStep2() {
  const { formData, updateFormData } = useMedicationForm();
  const [showCustomTimes, setShowCustomTimes] = useState(false);

  const handleAddTime = () => {
    updateFormData({ scheduleTimes: [...formData.scheduleTimes, '12:00'] });
  };

  const handleRemoveTime = (index: number) => {
    const newTimes = formData.scheduleTimes.filter((_, i) => i !== index);
    updateFormData({ scheduleTimes: newTimes });
  };

  const handleTimeChange = (index: number, time: string) => {
    const newTimes = [...formData.scheduleTimes];
    newTimes[index] = time;
    updateFormData({ scheduleTimes: newTimes });
  };

  const handleQuickSelect = (times: string[]) => {
    updateFormData({ scheduleTimes: times });
    setShowCustomTimes(false);
  };

  const handleScheduleTypeChange = (type: ScheduleType) => {
    updateFormData({ scheduleType: type });
    // Reset times when switching to as-needed
    if (type === 'as-needed') {
      updateFormData({ scheduleTimes: [] });
    } else if (formData.scheduleTimes.length === 0) {
      updateFormData({ scheduleTimes: ['08:00'] });
    }
  };

  // For as-needed, we don't need times
  const canProceed = formData.scheduleType === 'as-needed' || formData.scheduleTimes.length > 0;

  return (
    <ScreenWrapper>
      <ProgressBar current={2} total={5} />

      <ScrollView className="flex-1 px-6 py-6">
        <Typography variant="h2" className="text-surface-900 dark:text-white mb-1">
          When do you take it?
        </Typography>
        <Typography variant="body" className="text-surface-500 dark:text-surface-400 mb-6">
          Step 2 of 5: Set your schedule
        </Typography>

        {/* Schedule Type */}
        <View className="mb-6">
          <Typography variant="label" className="text-surface-600 dark:text-surface-400 mb-3 uppercase tracking-wider text-xs">
            Frequency Type
          </Typography>
          <View className="gap-3">
            {SCHEDULE_OPTIONS.map((option) => {
              const isSelected = formData.scheduleType === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => handleScheduleTypeChange(option.value)}
                  className={`flex-row items-center p-4 rounded-2xl border-2 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                      : 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800'
                  }`}
                >
                  <View
                    className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${option.bgColor}`}
                  >
                    <Ionicons name={option.icon} size={24} color={option.iconColor} />
                  </View>
                  <View className="flex-1">
                    <Typography
                      variant="body"
                      className={`font-semibold ${
                        isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-surface-900 dark:text-white'
                      }`}
                    >
                      {option.label}
                    </Typography>
                    <Typography variant="small" className="text-surface-500 dark:text-surface-400">
                      {option.description}
                    </Typography>
                  </View>
                  {isSelected && (
                    <View className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center">
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* As-Needed Info */}
        {formData.scheduleType === 'as-needed' && (
          <View className="mb-6 bg-accent-50 dark:bg-accent-950 rounded-2xl p-4 border border-accent-200 dark:border-accent-800">
            <View className="flex-row items-start">
              <View className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-900 items-center justify-center mr-3">
                <Ionicons name="information-circle" size={24} color="#F97316" />
              </View>
              <View className="flex-1">
                <Typography variant="body" className="text-accent-800 dark:text-accent-200 font-semibold mb-1">
                  As Needed (PRN) Medication
                </Typography>
                <Typography variant="small" className="text-accent-700 dark:text-accent-300">
                  This medication won't have scheduled reminders. You can log doses manually whenever you take them.
                </Typography>
              </View>
            </View>
          </View>
        )}

        {/* Quick Schedules (for daily/weekly) */}
        {(formData.scheduleType === 'daily' || formData.scheduleType === 'weekly') && !showCustomTimes && (
          <View className="mb-6">
            <Typography variant="label" className="text-surface-600 dark:text-surface-400 mb-3 uppercase tracking-wider text-xs">
              Quick Select
            </Typography>
            <View className="gap-2">
              {COMMON_SCHEDULES.map((schedule) => {
                const isSelected = JSON.stringify(formData.scheduleTimes) === JSON.stringify(schedule.times);
                return (
                  <Pressable
                    key={schedule.label}
                    onPress={() => handleQuickSelect(schedule.times)}
                    className={`flex-row items-center py-4 px-4 rounded-xl ${
                      isSelected
                        ? 'bg-primary-100 dark:bg-primary-900 border-2 border-primary-500'
                        : 'bg-surface-100 dark:bg-surface-800 border-2 border-transparent'
                    }`}
                  >
                    <View
                      className={`w-8 h-8 rounded-lg items-center justify-center mr-3 ${
                        isSelected ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700'
                      }`}
                    >
                      <Typography
                        variant="body"
                        className={`font-bold ${isSelected ? 'text-white' : 'text-surface-600 dark:text-surface-400'}`}
                      >
                        {schedule.icon}
                      </Typography>
                    </View>
                    <View className="flex-1">
                      <Typography
                        variant="body"
                        className={`font-medium ${
                          isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-surface-900 dark:text-white'
                        }`}
                      >
                        {schedule.label}
                      </Typography>
                      <Typography variant="small" className="text-surface-500 dark:text-surface-400">
                        {schedule.times.join(' • ')}
                      </Typography>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={24} color="#06B6D4" />
                    )}
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              onPress={() => setShowCustomTimes(true)}
              className="py-3 mt-2"
            >
              <Typography variant="body" className="text-primary-500 dark:text-primary-400 font-medium text-center">
                Set custom times...
              </Typography>
            </Pressable>
          </View>
        )}

        {/* Custom Times */}
        {showCustomTimes && formData.scheduleType !== 'as-needed' && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Typography variant="label" className="text-surface-600 dark:text-surface-400 uppercase tracking-wider text-xs">
                Custom Times
              </Typography>
              <Pressable onPress={() => setShowCustomTimes(false)}>
                <Typography variant="small" className="text-primary-500 font-medium">
                  Back to presets
                </Typography>
              </Pressable>
            </View>
            <Typography variant="small" className="text-surface-500 dark:text-surface-400 mb-4">
              Use 24-hour format (e.g., 08:00 for 8 AM, 20:00 for 8 PM)
            </Typography>
            {formData.scheduleTimes.map((time, index) => (
              <View key={index} className="flex-row items-center mb-3">
                <View className="flex-1">
                  <Input
                    value={time}
                    onChangeText={(newTime) => handleTimeChange(index, newTime)}
                    placeholder="08:00"
                    keyboardType="number-pad"
                    size="lg"
                  />
                </View>
                {formData.scheduleTimes.length > 1 && (
                  <Pressable
                    onPress={() => handleRemoveTime(index)}
                    className="ml-3 w-12 h-12 rounded-xl bg-danger-50 dark:bg-danger-950 items-center justify-center"
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </Pressable>
                )}
              </View>
            ))}
            <Pressable
              onPress={handleAddTime}
              className="flex-row items-center justify-center py-4 rounded-xl border-2 border-dashed border-surface-300 dark:border-surface-600"
            >
              <Ionicons name="add-circle-outline" size={20} color="#06B6D4" />
              <Typography variant="body" className="text-primary-500 ml-2 font-medium">
                Add Another Time
              </Typography>
            </Pressable>
          </View>
        )}

        {/* Interval Config (for interval type) */}
        {formData.scheduleType === 'interval' && (
          <View className="mb-6">
            <Typography variant="label" className="text-surface-600 dark:text-surface-400 mb-3 uppercase tracking-wider text-xs">
              Interval Settings
            </Typography>
            <View className="bg-surface-100 dark:bg-surface-800 rounded-xl p-4">
              <Typography variant="body" className="text-surface-700 dark:text-surface-300 mb-3">
                Take every:
              </Typography>
              <View className="flex-row items-center">
                <Input
                  value={String(formData.scheduleIntervalHours)}
                  onChangeText={(text) => {
                    const hours = parseInt(text) || 6;
                    updateFormData({ scheduleIntervalHours: hours });
                  }}
                  placeholder="6"
                  keyboardType="number-pad"
                  size="lg"
                  className="w-24"
                />
                <Typography variant="body" className="text-surface-600 dark:text-surface-400 ml-3">
                  hours
                </Typography>
              </View>
              <Typography variant="small" className="text-surface-500 dark:text-surface-400 mt-3">
                Starting from the first dose each day
              </Typography>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View className="px-6 pb-8 pt-4 bg-white dark:bg-surface-900 border-t border-surface-100 dark:border-surface-800">
        <View className="flex-row gap-3">
          <Button
            title="Back"
            variant="secondary"
            size="lg"
            onPress={() => router.back()}
            className="flex-1"
          />
          <Button
            title="Next"
            size="lg"
            onPress={() => router.push('/medication/meal')}
            disabled={!canProceed}
            className="flex-1"
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

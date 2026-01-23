import { View, ScrollView, Pressable } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useMedicationForm } from '../../src/contexts/MedicationFormContext';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Input } from '../../src/components/ui/Input';

const SCHEDULE_TYPES = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Every X Hours', value: 'interval' },
];

const COMMON_SCHEDULES = [
  { label: 'Once daily', times: ['08:00'] },
  { label: 'Twice daily', times: ['08:00', '20:00'] },
  { label: 'Three times daily', times: ['08:00', '14:00', '20:00'] },
  { label: 'Four times daily', times: ['08:00', '12:00', '16:00', '20:00'] },
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

  const canProceed = formData.scheduleTimes.length > 0;

  return (
    <ScreenWrapper>
      <ProgressBar current={2} total={5} />

      <ScrollView className="flex-1 px-6 py-8">
        <Typography variant="h2" className="text-gray-900 dark:text-white mb-2">
          When do you take it?
        </Typography>
        <Typography variant="body" className="text-gray-500 dark:text-gray-400 mb-8">
          Step 2 of 5: Set your schedule
        </Typography>

        {/* Schedule Type */}
        <View className="mb-6">
          <Typography variant="label" className="text-gray-700 dark:text-gray-300 mb-3">
            Frequency
          </Typography>
          <View className="flex-row flex-wrap gap-2">
            {SCHEDULE_TYPES.map((type) => (
              <Pressable
                key={type.value}
                onPress={() => updateFormData({ scheduleType: type.value as any })}
                className={`px-4 py-3 rounded-xl flex-1 ${
                  formData.scheduleType === type.value
                    ? 'bg-green-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Typography
                  variant="body"
                  className={
                    formData.scheduleType === type.value
                      ? 'text-white font-semibold'
                      : 'text-gray-700 dark:text-gray-300'
                  }
                >
                  {type.label}
                </Typography>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Quick Schedules */}
        {formData.scheduleType !== 'interval' && !showCustomTimes && (
          <View className="mb-6">
            <Typography variant="label" className="text-gray-700 dark:text-gray-300 mb-3">
              Quick select
            </Typography>
            {COMMON_SCHEDULES.map((schedule) => (
              <Pressable
                key={schedule.label}
                onPress={() => handleQuickSelect(schedule.times)}
                className={`py-4 px-4 rounded-xl mb-2 ${
                  JSON.stringify(formData.scheduleTimes) === JSON.stringify(schedule.times)
                    ? 'bg-green-100 dark:bg-green-900 border-2 border-green-500'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <Typography variant="body" className="text-gray-900 dark:text-white font-medium">
                  {schedule.label}
                </Typography>
                <Typography variant="small" className="text-gray-500 dark:text-gray-400">
                  {schedule.times.join(', ')}
                </Typography>
              </Pressable>
            ))}
            <Pressable
              onPress={() => setShowCustomTimes(true)}
              className="py-3"
            >
              <Typography variant="body" className="text-green-500 font-medium text-center">
                Custom times...
              </Typography>
            </Pressable>
          </View>
        )}

        {/* Custom Times */}
        {showCustomTimes && (
          <View className="mb-6">
            <Typography variant="label" className="text-gray-700 dark:text-gray-300 mb-3">
              Reminder times (24-hour format, e.g., 08:00)
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
                  <Button
                    title="Remove"
                    variant="outline"
                    size="sm"
                    onPress={() => handleRemoveTime(index)}
                    className="ml-2"
                  />
                )}
              </View>
            ))}
            <Button
              title="+ Add Another Time"
              variant="outline"
              size="lg"
              onPress={handleAddTime}
              fullWidth
            />
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View className="px-6 pb-8 flex-row gap-3">
        <Button
          title="Back"
          variant="outline"
          size="xl"
          onPress={() => router.back()}
          className="flex-1"
        />
        <Button
          title="Next"
          size="xl"
          onPress={() => router.push('/medication/meal')}
          disabled={!canProceed}
          className="flex-1"
        />
      </View>
    </ScreenWrapper>
  );
}

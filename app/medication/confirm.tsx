import { View, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useMedicationForm } from '../../src/contexts/MedicationFormContext';
import { MedicationService } from '../../src/services/medication.service';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Card } from '../../src/components/ui/Card';
import { MealTimingBadge } from '../../src/components/medication/MealTimingBadge';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';

export default function AddMedicationStep5() {
  const { formData, resetForm, isEditing, editingId } = useMedicationForm();
  const [isSaving, setIsSaving] = useState(false);

  const formatSchedule = () => {
    const times = formData.scheduleTimes.join(', ');
    if (formData.scheduleType === 'daily') {
      return `Daily at ${times}`;
    } else if (formData.scheduleType === 'weekly') {
      const days = formData.scheduleWeekdays
        .map((d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d])
        .join(', ');
      return `${days} at ${times}`;
    } else {
      return `Every ${formData.scheduleIntervalHours} hours starting at ${formData.scheduleTimes[0]}`;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (isEditing && editingId) {
        await MedicationService.update(editingId, formData);
      } else {
        await MedicationService.create(formData);
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      resetForm();
      
      Alert.alert(
        '✓ Saved!',
        `${formData.name} has been ${isEditing ? 'updated' : 'added'} to your medications.`,
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/medications') }]
      );
    } catch (error) {
      console.error('Error saving medication:', error);
      Alert.alert('Error', 'Failed to save medication. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenWrapper>
      <ProgressBar current={5} total={5} />

      <ScrollView className="flex-1 px-6 py-8">
        <Typography variant="h2" className="text-gray-900 dark:text-white mb-2">
          Review & Save
        </Typography>
        <Typography variant="body" className="text-gray-500 dark:text-gray-400 mb-8">
          Step 5 of 5: Make sure everything looks right
        </Typography>

        {/* Summary Card */}
        <Card className="p-6 mb-6">
          {/* Name & Dosage */}
          <View className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <Typography variant="small" className="text-gray-500 dark:text-gray-400 mb-1">
              Medication
            </Typography>
            <Typography variant="h2" className="text-gray-900 dark:text-white">
              {formData.name}
            </Typography>
            <Typography variant="body" className="text-gray-600 dark:text-gray-300">
              {formData.dosage} {formData.dosageUnit}
            </Typography>
          </View>

          {/* Schedule */}
          <View className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <Typography variant="small" className="text-gray-500 dark:text-gray-400 mb-1">
              Schedule
            </Typography>
            <Typography variant="body" className="text-gray-900 dark:text-white font-medium">
              {formatSchedule()}
            </Typography>
          </View>

          {/* Meal Timing */}
          <View className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <Typography variant="small" className="text-gray-500 dark:text-gray-400 mb-1">
              Meal Timing
            </Typography>
            <MealTimingBadge timing={formData.mealTiming} size="lg" />
          </View>

          {/* Duration */}
          <View className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <Typography variant="small" className="text-gray-500 dark:text-gray-400 mb-1">
              Duration
            </Typography>
            <Typography variant="body" className="text-gray-900 dark:text-white font-medium">
              Starts {format(formData.startDate, 'MMM d, yyyy')}
            </Typography>
            {formData.hasEndDate && formData.endDate && (
              <Typography variant="body" className="text-gray-600 dark:text-gray-300">
                Ends {format(formData.endDate, 'MMM d, yyyy')}
              </Typography>
            )}
            {!formData.hasEndDate && (
              <Typography variant="body" className="text-gray-600 dark:text-gray-300">
                Ongoing (no end date)
              </Typography>
            )}
          </View>

          {/* Instructions */}
          {formData.instructions && (
            <View>
              <Typography variant="small" className="text-gray-500 dark:text-gray-400 mb-1">
                Instructions
              </Typography>
              <Typography variant="body" className="text-gray-900 dark:text-white">
                {formData.instructions}
              </Typography>
            </View>
          )}
        </Card>

        {/* Edit Link */}
        <Button
          title="Edit Details"
          variant="ghost"
          size="lg"
          onPress={() => router.push('/medication/index')}
          fullWidth
        />
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
          title={isSaving ? 'Saving...' : 'Save Medication'}
          size="xl"
          onPress={handleSave}
          disabled={isSaving}
          className="flex-1"
        />
      </View>
    </ScreenWrapper>
  );
}

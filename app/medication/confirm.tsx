import { View, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { useMedicationForm } from '../../src/contexts/MedicationFormContext';
import { MedicationService } from '../../src/services/medication.service';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { MealTimingBadge } from '../../src/components/medication/MealTimingBadge';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { Medication } from '../../src/types';

export default function AddMedicationStep5() {
  const { formData, resetForm, isEditing, editingId } = useMedicationForm();
  const [isSaving, setIsSaving] = useState(false);
  const [dependencyMed, setDependencyMed] = useState<Medication | null>(null);

  useEffect(() => {
    if (formData.dependsOnMedicationId) {
      MedicationService.getAll().then((meds) => {
        const dep = meds.find((m) => m.id === formData.dependsOnMedicationId);
        if (dep) setDependencyMed(dep);
      });
    }
  }, [formData.dependsOnMedicationId]);

  const formatSchedule = () => {
    if (formData.scheduleType === 'as-needed') {
      return 'As needed (PRN)';
    }
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

  const getEffectiveStartDate = () => {
    if (dependencyMed?.endDate && formData.dependsOnOffsetDays !== undefined) {
      return addDays(new Date(dependencyMed.endDate), formData.dependsOnOffsetDays);
    }
    return formData.startDate;
  };

  return (
    <ScreenWrapper>
      <ProgressBar current={5} total={5} />

      <ScrollView className="flex-1 px-6 py-6">
        <Typography variant="h2" className="text-surface-900 dark:text-white mb-1">
          Review & Save
        </Typography>
        <Typography variant="body" className="text-surface-500 dark:text-surface-400 mb-6">
          Step 5 of 5: Make sure everything looks right
        </Typography>

        {/* Header Card with Color & Name */}
        <View className="bg-white dark:bg-surface-800 rounded-2xl border-2 border-surface-200 dark:border-surface-700 p-5 mb-4">
          <View className="flex-row items-center">
            <View
              className="w-14 h-14 rounded-xl items-center justify-center mr-4"
              style={{ backgroundColor: formData.color }}
            >
              <Ionicons name="medical" size={28} color="#fff" />
            </View>
            <View className="flex-1">
              <Typography variant="h2" className="text-surface-900 dark:text-white">
                {formData.name}
              </Typography>
              <Typography variant="body" className="text-surface-500 dark:text-surface-400">
                {formData.dosage} {formData.dosageUnit}
              </Typography>
            </View>
          </View>
        </View>

        {/* Details Card */}
        <View className="bg-white dark:bg-surface-800 rounded-2xl border-2 border-surface-200 dark:border-surface-700 p-5 mb-4">
          {/* Schedule */}
          <View className="flex-row items-start mb-4 pb-4 border-b border-surface-100 dark:border-surface-700">
            <View className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950 items-center justify-center mr-3">
              <Ionicons name="calendar-outline" size={20} color="#06B6D4" />
            </View>
            <View className="flex-1">
              <Typography variant="small" className="text-surface-500 dark:text-surface-400 mb-0.5">
                Schedule
              </Typography>
              <Typography variant="body" className="text-surface-900 dark:text-white font-semibold">
                {formatSchedule()}
              </Typography>
            </View>
          </View>

          {/* Meal Timing - only show for scheduled medications */}
          {formData.scheduleType !== 'as-needed' && (
            <View className="flex-row items-start mb-4 pb-4 border-b border-surface-100 dark:border-surface-700">
              <View className="w-10 h-10 rounded-lg bg-accent-50 dark:bg-accent-950 items-center justify-center mr-3">
                <Ionicons name="restaurant-outline" size={20} color="#F97316" />
              </View>
              <View className="flex-1">
                <Typography variant="small" className="text-surface-500 dark:text-surface-400 mb-1">
                  Meal Timing
                </Typography>
                <MealTimingBadge timing={formData.mealTiming} size="lg" />
              </View>
            </View>
          )}

          {/* Duration */}
          <View className="flex-row items-start mb-4 pb-4 border-b border-surface-100 dark:border-surface-700">
            <View className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-950 items-center justify-center mr-3">
              <Ionicons name="time-outline" size={20} color="#8B5CF6" />
            </View>
            <View className="flex-1">
              <Typography variant="small" className="text-surface-500 dark:text-surface-400 mb-0.5">
                Duration
              </Typography>
              <Typography variant="body" className="text-surface-900 dark:text-white font-semibold">
                Starts {format(getEffectiveStartDate(), 'MMM d, yyyy')}
              </Typography>
              {formData.hasEndDate && formData.endDate && (
                <Typography variant="small" className="text-surface-500 dark:text-surface-400">
                  Ends {format(formData.endDate, 'MMM d, yyyy')}
                </Typography>
              )}
              {!formData.hasEndDate && (
                <Typography variant="small" className="text-surface-500 dark:text-surface-400">
                  Ongoing (no end date)
                </Typography>
              )}
            </View>
          </View>

          {/* Dependency */}
          {dependencyMed && (
            <View className="flex-row items-start mb-4 pb-4 border-b border-surface-100 dark:border-surface-700">
              <View className="w-10 h-10 rounded-lg bg-warning-50 dark:bg-warning-950 items-center justify-center mr-3">
                <Ionicons name="link-outline" size={20} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Typography variant="small" className="text-surface-500 dark:text-surface-400 mb-0.5">
                  Depends On
                </Typography>
                <Typography variant="body" className="text-surface-900 dark:text-white font-semibold">
                  {dependencyMed.name}
                </Typography>
                <Typography variant="small" className="text-surface-500 dark:text-surface-400">
                  Start {formData.dependsOnOffsetDays === 0 ? 'immediately' : `${formData.dependsOnOffsetDays} day${formData.dependsOnOffsetDays !== 1 ? 's' : ''}`} after completion
                </Typography>
              </View>
            </View>
          )}

          {/* Instructions */}
          {formData.instructions ? (
            <View className="flex-row items-start">
              <View className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-700 items-center justify-center mr-3">
                <Ionicons name="document-text-outline" size={20} color="#737373" />
              </View>
              <View className="flex-1">
                <Typography variant="small" className="text-surface-500 dark:text-surface-400 mb-0.5">
                  Instructions
                </Typography>
                <Typography variant="body" className="text-surface-900 dark:text-white">
                  {formData.instructions}
                </Typography>
              </View>
            </View>
          ) : null}
        </View>

        {/* Edit Link */}
        <Button
          title="Edit Details"
          variant="secondary"
          size="lg"
          onPress={() => router.push('/medication/index')}
          fullWidth
        />
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
            title={isSaving ? 'Saving...' : 'Save Medication'}
            size="lg"
            onPress={handleSave}
            disabled={isSaving}
            className="flex-1"
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

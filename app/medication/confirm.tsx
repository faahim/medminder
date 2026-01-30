import { View, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, addDays } from 'date-fns';
import * as Haptics from 'expo-haptics';

import { useMedicationForm } from '../../src/contexts/MedicationFormContext';
import { MedicationService } from '../../src/services/medication.service';
import { Screen } from '../../src/components/layout/Screen';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { MealTimingBadge } from '../../src/components/medication/MealTimingBadge';
import { Icon } from '../../src/components/ui/Icon';
import { Medication } from '../../src/types';

export default function AddMedicationStep5() {
  const insets = useSafeAreaInsets();
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
    if (formData.scheduleType === 'as-needed') return 'As needed (PRN)';
    const times = formData.scheduleTimes.join(', ');
    if (formData.scheduleType === 'daily') return `Daily at ${times}`;
    if (formData.scheduleType === 'weekly') {
      const days = formData.scheduleWeekdays.map((d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ');
      return `${days} at ${times}`;
    }
    if (formData.scheduleType === 'interval') return `Every ${formData.scheduleIntervalHours} hours`;
    return 'Custom schedule';
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (isEditing && editingId) {
        await MedicationService.update(editingId, formData);
      } else {
        await MedicationService.create(formData);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      resetForm();
      router.replace('/(tabs)/medications');
    } catch (error) {
      Alert.alert('Error', 'Failed to save medication. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-surface-50">
      <ProgressBar current={5} total={5} />

      <Screen scroll includeTopInset={false} padX={16} padY={16} padBottomExtra={170}>
        <Typography variant="h2" className="text-surface-900 mb-1">
          Review & confirm
        </Typography>
        <Typography variant="body" className="text-surface-500 mb-6">
          Step 5 of 5 · Check everything
        </Typography>

        <View className="bg-white rounded-3xl border border-surface-100 overflow-hidden">
          {/* Basic info */}
          <View className="p-5 border-b border-surface-100">
            <View className="flex-row items-start mb-4">
              <View className="w-14 h-14 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: formData.color }}>
                <Icon name="pills" fallback="medkit" size={24} color="#fff" />
              </View>
              <View className="flex-1">
                <Typography variant="h3" className="text-surface-900 font-bold mb-1">
                  {formData.name}
                </Typography>
                <Typography variant="body" className="text-surface-600">
                  {formData.dosage} {formData.dosageUnit}
                </Typography>
              </View>
            </View>

            {formData.instructions ? (
              <View className="bg-surface-50 rounded-2xl p-3 flex-row items-start">
                <Icon name="doc.text" fallback="document-text" size={18} color="#737373" />
                <Typography variant="small" className="text-surface-700 ml-2 flex-1">
                  {formData.instructions}
                </Typography>
              </View>
            ) : null}
          </View>

          {/* Schedule */}
          <View className="p-5 border-b border-surface-100">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-xl bg-primary-50 items-center justify-center mr-3">
                <Icon name="calendar" fallback="calendar" size={16} color="#06B6D4" />
              </View>
              <Typography variant="label" className="text-surface-500 uppercase tracking-wider text-xs">
                Schedule
              </Typography>
            </View>
            <Typography variant="body" className="text-surface-900 font-medium">
              {formatSchedule()}
            </Typography>
          </View>

          {/* Meal timing */}
          <View className="p-5 border-b border-surface-100">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-xl bg-accent-50 items-center justify-center mr-3">
                <Icon name="fork.knife" fallback="utensils" size={16} color="#F97316" />
              </View>
              <Typography variant="label" className="text-surface-500 uppercase tracking-wider text-xs">
                Meal timing
              </Typography>
            </View>
            <MealTimingBadge timing={formData.mealTiming} />
          </View>

          {/* Duration */}
          <View className="p-5">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-xl bg-surface-100 items-center justify-center mr-3">
                <Icon name="clock" fallback="time" size={16} color="#737373" />
              </View>
              <Typography variant="label" className="text-surface-500 uppercase tracking-wider text-xs">
                Duration
              </Typography>
            </View>

            {dependencyMed ? (
              <View className="bg-surface-50 rounded-2xl p-3 mb-2">
                <Typography variant="small" className="text-surface-600 mb-1">
                  Starts after <Typography variant="small" className="font-semibold text-surface-900">{dependencyMed.name}</Typography>
                </Typography>
                <Typography variant="small" className="text-surface-500">
                  +{formData.dependsOnOffsetDays} days wait
                </Typography>
              </View>
            ) : (
              <Typography variant="body" className="text-surface-900 font-medium">
                Starts {format(formData.startDate, 'MMM d, yyyy')}
              </Typography>
            )}

            {formData.hasEndDate && formData.endDate ? (
              <Typography variant="body" className="text-surface-900 font-medium mt-1">
                Ends {format(formData.endDate, 'MMM d, yyyy')}
              </Typography>
            ) : (
              <View className="flex-row items-center mt-1">
                <Icon name="infinity" fallback="repeat" size={18} color="#737373" />
                <Typography variant="body" className="text-surface-600 ml-2">
                  Ongoing
                </Typography>
              </View>
            )}
          </View>
        </View>

        <Button title="Edit Details" variant="secondary" size="lg" onPress={() => router.push('/medication/index')} fullWidth className="mt-4" />
      </Screen>

      <View className="px-6 pt-4 bg-white border-t border-surface-100" style={{ paddingBottom: insets.bottom + 16 }}>
        <View className="flex-row gap-3">
          <Button title="Back" variant="secondary" size="lg" onPress={() => router.back()} className="flex-1" />
          <Button
            title={isSaving ? 'Saving…' : isEditing ? 'Update' : 'Save'}
            size="lg"
            onPress={handleSave}
            disabled={isSaving}
            className="flex-1"
          />
        </View>
      </View>
    </View>
  );
}

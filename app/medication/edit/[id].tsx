import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { MedicationService } from '../../../src/services/medication.service';
import { useMedicationForm } from '../../../src/contexts/MedicationFormContext';
import { router } from 'expo-router';
import { parseISO } from 'date-fns';
import { View } from 'react-native';
import { Typography } from '../../../src/components/ui/Typography';

// This screen loads medication data and redirects to the add wizard
// The add wizard checks if it's in edit mode and handles the rest

export default function EditMedicationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { updateFormData, setIsEditing, setEditingId } = useMedicationForm();

  useEffect(() => {
    async function loadMedication() {
      if (!id) {
        router.back();
        return;
      }

      const medication = await MedicationService.getById(id);
      if (!medication) {
        router.back();
        return;
      }

      // Populate form with medication data
      updateFormData({
        name: medication.name,
        dosage: medication.dosage,
        dosageUnit: medication.dosageUnit,
        instructions: medication.instructions || '',
        mealTiming: medication.mealTiming,
        scheduleType: medication.scheduleType,
        scheduleTimes: JSON.parse(medication.scheduleTimes),
        scheduleWeekdays: medication.scheduleWeekdays ? JSON.parse(medication.scheduleWeekdays) : [],
        scheduleIntervalHours: medication.scheduleIntervalHours || 6,
        startDate: parseISO(medication.startDate),
        endDate: medication.endDate ? parseISO(medication.endDate) : null,
        hasEndDate: !!medication.endDate,
        color: medication.color,
      });

      setIsEditing(true);
      setEditingId(medication.id);

      // Redirect to add wizard
      router.replace('/medication/index');
    }

    loadMedication();
  }, [id, updateFormData, setIsEditing, setEditingId]);

  return (
    <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Typography variant="body">Loading medication...</Typography>
    </View>
  );
}

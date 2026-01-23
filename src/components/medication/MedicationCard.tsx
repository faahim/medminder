import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui/Typography';
import { MealTimingBadge } from './MealTimingBadge';
import { Medication } from '../../types';

interface MedicationCardProps {
  medication: Medication;
  showChevron?: boolean;
}

export function MedicationCard({ medication, showChevron = false }: MedicationCardProps) {
  const times = JSON.parse(medication.scheduleTimes) as string[];
  const frequency = times.length === 1 ? '1x daily' : `${times.length}x daily`;

  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex-row items-center shadow-sm">
      {/* Color indicator */}
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: medication.color + '30' }}
      >
        <Ionicons name="medical" size={24} color={medication.color} />
      </View>

      {/* Info */}
      <View className="flex-1">
        <Typography variant="h3" className="text-gray-900 dark:text-white">
          {medication.name}
        </Typography>
        <Typography variant="small" className="text-gray-500 dark:text-gray-400">
          {medication.dosage} {medication.dosageUnit} · {frequency}
        </Typography>
        <MealTimingBadge timing={medication.mealTiming} size="sm" />
      </View>

      {/* Chevron */}
      {showChevron && (
        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
      )}
    </View>
  );
}

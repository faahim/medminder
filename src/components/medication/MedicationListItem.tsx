import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui/Typography';
import { Medication } from '../../types';

interface MedicationListItemProps {
  medication: Medication;
  onPress: () => void;
}

export function MedicationListItem({ medication, onPress }: MedicationListItemProps) {
  const times = JSON.parse(medication.scheduleTimes) as string[];
  const frequency = times.length === 1 ? '1x daily' : `${times.length}x daily`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`${medication.name} ${medication.dosage}`}
      accessibilityRole="button"
      accessibilityHint="Tap to view details"
    >
      <View className="bg-white rounded-2xl p-4 flex-row items-center shadow-sm active:bg-surface-50">
        {/* Color indicator */}
        <View
          className="w-12 h-12 rounded-full items-center justify-center mr-4"
          style={{ backgroundColor: medication.color + '30' }}
        >
          <Ionicons name="medkit" size={24} color={medication.color} />
        </View>

        {/* Info */}
        <View className="flex-1">
          <Typography variant="h3" className="text-surface-900">
            {medication.name}
          </Typography>
          <Typography variant="small" className="text-surface-500">
            {medication.dosage} {medication.dosageUnit} · {frequency}
          </Typography>
        </View>

        {/* Chevron */}
        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
      </View>
    </Pressable>
  );
}

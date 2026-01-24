import { View, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Typography } from '../ui/Typography';
import { MealTimingBadge } from './MealTimingBadge';
import { Medication } from '../../types';

interface AsNeededCardProps {
  medication: Medication;
  onLogDose: (medicationId: string) => Promise<void>;
  todayCount?: number;
}

export function AsNeededCard({ medication, onLogDose, todayCount = 0 }: AsNeededCardProps) {
  const [isLogging, setIsLogging] = useState(false);
  const [localCount, setLocalCount] = useState(todayCount);

  const handleLogDose = async () => {
    setIsLogging(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await onLogDose(medication.id);
      setLocalCount(prev => prev + 1);
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <View
      className="bg-white rounded-2xl border border-accent-200 mb-3 overflow-hidden"
      style={{
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="p-4">
        <View className="flex-row items-center">
          {/* Icon Badge */}
          <View
            className="w-14 h-14 rounded-xl items-center justify-center mr-4"
            style={{ backgroundColor: medication.color + '15' }}
          >
            <Ionicons name="flash" size={24} color={medication.color} />
          </View>

          {/* Medication Info */}
          <View className="flex-1">
            <View className="flex-row items-center mb-0.5">
              <Typography variant="h3" className="text-surface-900 font-semibold">
                {medication.name}
              </Typography>
              <View className="ml-2 px-2 py-0.5 bg-accent-100 rounded-full">
                <Typography variant="small" className="text-accent-600 font-medium">
                  PRN
                </Typography>
              </View>
            </View>
            <Typography variant="small" className="text-surface-500 mb-1">
              {medication.dosage} {medication.dosageUnit}
            </Typography>
            <View className="flex-row items-center">
              <MealTimingBadge timing={medication.mealTiming} />
              {localCount > 0 && (
                <View className="ml-2 flex-row items-center">
                  <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                  <Typography variant="small" className="text-success-600 ml-1">
                    {localCount}x today
                  </Typography>
                </View>
              )}
            </View>
          </View>

          {/* Log Button */}
          <Pressable
            onPress={handleLogDose}
            disabled={isLogging}
            className="bg-accent-500 active:bg-accent-600 px-4 py-3 rounded-xl"
          >
            {isLogging ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="add-circle" size={18} color="#fff" />
                <Typography variant="button" className="text-white ml-1.5 font-semibold">
                  Log
                </Typography>
              </View>
            )}
          </Pressable>
        </View>

        {/* Instructions (if any) */}
        {medication.instructions && (
          <View className="mt-3 pt-3 border-t border-surface-100">
            <Typography variant="small" className="text-surface-500 italic">
              {medication.instructions}
            </Typography>
          </View>
        )}
      </View>
    </View>
  );
}

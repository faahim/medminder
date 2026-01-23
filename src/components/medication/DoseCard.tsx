import { View, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Typography } from '../ui/Typography';
import { MealTimingBadge } from './MealTimingBadge';
import { ScheduledDose, DoseStatus } from '../../types';

interface DoseCardProps {
  dose: ScheduledDose;
  onStatusChange: (status: DoseStatus) => void;
  onLogDose?: (medicationId: string, date: string, time: string, status: DoseStatus) => Promise<void>;
}

export function DoseCard({ dose, onStatusChange, onLogDose }: DoseCardProps) {
  const [isLogging, setIsLogging] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleTake = async () => {
    setIsLogging(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (onLogDose) {
        await onLogDose(
          dose.medication.id,
          dose.scheduledDate,
          dose.scheduledTime,
          'taken'
        );
      }
      onStatusChange('taken');
    } finally {
      setIsLogging(false);
      setShowActions(false);
    }
  };

  const handleSkip = async () => {
    setIsLogging(true);
    try {
      if (onLogDose) {
        await onLogDose(
          dose.medication.id,
          dose.scheduledDate,
          dose.scheduledTime,
          'skipped'
        );
      }
      onStatusChange('skipped');
    } finally {
      setIsLogging(false);
      setShowActions(false);
    }
  };

  const statusColors = {
    pending: 'border-gray-300 dark:border-gray-600',
    taken: 'border-green-500 bg-green-50 dark:bg-green-900/30',
    missed: 'border-red-500 bg-red-50 dark:bg-red-900/30',
    skipped: 'border-gray-400 bg-gray-100 dark:bg-gray-700',
  };

  return (
    <View className={`bg-white dark:bg-gray-800 rounded-xl p-4 border-2 ${statusColors[dose.status]}`}>
      {/* Medication Info */}
      <View className="flex-row items-center mb-3">
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: dose.medication.color + '30' }}
        >
          <Ionicons name="medical" size={20} color={dose.medication.color} />
        </View>
        <View className="flex-1">
          <Typography variant="h3" className="text-gray-900 dark:text-white">
            {dose.medication.name}
          </Typography>
          <Typography variant="small" className="text-gray-500 dark:text-gray-400">
            {dose.medication.dosage} {dose.medication.dosageUnit}
          </Typography>
        </View>
        <MealTimingBadge timing={dose.medication.mealTiming} />
      </View>

      {/* Action Button */}
      {dose.status === 'pending' && (
        <View>
          {!showActions ? (
            <Pressable
              onPress={handleTake}
              disabled={isLogging}
              accessibilityLabel={`Take ${dose.medication.name}`}
              accessibilityRole="button"
              accessibilityHint="Marks this dose as taken"
              className="
                flex-row items-center justify-center
                bg-green-500 active:bg-green-600
                py-4 rounded-xl
              "
            >
              {isLogging ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  <Typography variant="button" className="text-white ml-2">
                    Take Now
                  </Typography>
                </>
              )}
            </Pressable>
          ) : (
            <View className="flex-row gap-2">
              <Pressable
                onPress={handleTake}
                disabled={isLogging}
                className="flex-1 bg-green-500 py-3 rounded-xl items-center"
              >
                {isLogging ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Typography variant="button" className="text-white">
                    ✓ Take
                  </Typography>
                )}
              </Pressable>
              <Pressable
                onPress={handleSkip}
                disabled={isLogging}
                className="flex-1 bg-gray-300 dark:bg-gray-600 py-3 rounded-xl items-center"
              >
                <Typography variant="button" className="text-gray-700 dark:text-gray-200">
                  Skip
                </Typography>
              </Pressable>
            </View>
          )}
          <Pressable onPress={() => setShowActions(!showActions)} className="py-2">
            <Typography variant="small" className="text-primary-500 text-center">
              {showActions ? 'Cancel' : 'More options'}
            </Typography>
          </Pressable>
        </View>
      )}

      {/* Status Display (if not pending) */}
      {dose.status !== 'pending' && (
        <View className="flex-row items-center justify-center py-2">
          {dose.status === 'taken' && (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
              <Typography variant="body" className="text-green-600 dark:text-green-400 ml-2 font-semibold">
                Taken
              </Typography>
            </>
          )}
          {dose.status === 'missed' && (
            <>
              <Ionicons name="close-circle" size={24} color="#EF4444" />
              <Typography variant="body" className="text-red-600 dark:text-red-400 ml-2 font-semibold">
                Missed
              </Typography>
            </>
          )}
          {dose.status === 'skipped' && (
            <>
              <Ionicons name="remove-circle" size={24} color="#6B7280" />
              <Typography variant="body" className="text-gray-600 dark:text-gray-400 ml-2 font-semibold">
                Skipped
              </Typography>
            </>
          )}
        </View>
      )}
    </View>
  );
}

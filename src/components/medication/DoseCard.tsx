import { View, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Typography } from '../ui/Typography';
import { MealTimingBadge } from './MealTimingBadge';
import { ScheduledDose, DoseStatus } from '../../types';
import { LinearGradient } from 'expo-linear-gradient';

interface DoseCardProps {
  dose: ScheduledDose;
  onStatusChange: (status: DoseStatus) => void;
  onLogDose?: (medicationId: string, date: string, time: string, status: DoseStatus) => Promise<void>;
}

const STATUS_CONFIG = {
  pending: {
    bg: 'bg-white dark:bg-surface-800',
    border: 'border-surface-200 dark:border-surface-700',
    icon: null,
    iconColor: '',
    label: null,
    labelColor: '',
  },
  taken: {
    bg: 'bg-success-50 dark:bg-success-950',
    border: 'border-success-200 dark:border-success-800',
    icon: 'checkmark-circle',
    iconColor: '#22C55E',
    label: 'Taken',
    labelColor: 'text-success-600 dark:text-success-400',
  },
  missed: {
    bg: 'bg-danger-50 dark:bg-danger-950',
    border: 'border-danger-200 dark:border-danger-800',
    icon: 'close-circle',
    iconColor: '#EF4444',
    label: 'Missed',
    labelColor: 'text-danger-600 dark:text-danger-400',
  },
  skipped: {
    bg: 'bg-surface-100 dark:bg-surface-800',
    border: 'border-surface-300 dark:border-surface-600',
    icon: 'remove-circle-outline',
    iconColor: '#737373',
    label: 'Skipped',
    labelColor: 'text-surface-500 dark:text-surface-400',
  },
};

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
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  const config = STATUS_CONFIG[dose.status];
  const formattedTime = dose.scheduledTime;

  return (
    <View
      className={`${config.bg} ${config.border} rounded-2xl border mb-3 overflow-hidden`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* Main Content */}
      <View className="p-4">
        <View className="flex-row items-center">
          {/* Time Badge */}
          <View
            className="w-14 h-14 rounded-xl items-center justify-center mr-4"
            style={{ backgroundColor: dose.medication.color + '15' }}
          >
            <Typography variant="h3" style={{ color: dose.medication.color }} className="font-bold">
              {formattedTime.split(':')[0]}
            </Typography>
            <Typography variant="small" style={{ color: dose.medication.color }} className="opacity-70 -mt-1">
              {formattedTime.split(':')[1]}
            </Typography>
          </View>

          {/* Medication Info */}
          <View className="flex-1">
            <View className="flex-row items-center mb-0.5">
              <Typography variant="h3" className="text-surface-900 dark:text-white font-semibold">
                {dose.medication.name}
              </Typography>
            </View>
            <Typography variant="small" className="text-surface-500 dark:text-surface-400 mb-1">
              {dose.medication.dosage} {dose.medication.dosageUnit}
            </Typography>
            <MealTimingBadge timing={dose.medication.mealTiming} />
          </View>

          {/* Status Icon (when not pending) */}
          {dose.status !== 'pending' && config.icon && (
            <View className="ml-2">
              <Ionicons name={config.icon as any} size={32} color={config.iconColor} />
            </View>
          )}
        </View>
      </View>

      {/* Action Button (for pending doses) */}
      {dose.status === 'pending' && (
        <View className="px-4 pb-4">
          {!showActions ? (
            <Pressable
              onPress={handleTake}
              disabled={isLogging}
              accessibilityLabel={`Take ${dose.medication.name}`}
              accessibilityRole="button"
              className="overflow-hidden rounded-xl"
            >
              <LinearGradient
                colors={['#06B6D4', '#0891B2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex-row items-center justify-center py-3.5"
              >
                {isLogging ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={22} color="#fff" />
                    <Typography variant="button" className="text-white ml-2 font-semibold">
                      Take Now
                    </Typography>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          ) : (
            <View className="flex-row gap-3">
              <Pressable
                onPress={handleTake}
                disabled={isLogging}
                className="flex-1 bg-primary-500 py-3.5 rounded-xl items-center flex-row justify-center"
              >
                {isLogging ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={18} color="#fff" />
                    <Typography variant="button" className="text-white ml-1.5 font-semibold">
                      Take
                    </Typography>
                  </>
                )}
              </Pressable>
              <Pressable
                onPress={handleSkip}
                disabled={isLogging}
                className="flex-1 bg-surface-200 dark:bg-surface-700 py-3.5 rounded-xl items-center flex-row justify-center"
              >
                <Ionicons name="close" size={18} color="#737373" />
                <Typography variant="button" className="text-surface-600 dark:text-surface-300 ml-1.5 font-medium">
                  Skip
                </Typography>
              </Pressable>
            </View>
          )}

          <Pressable
            onPress={() => setShowActions(!showActions)}
            className="pt-2.5 pb-0.5"
          >
            <Typography variant="small" className="text-primary-500 dark:text-primary-400 text-center font-medium">
              {showActions ? 'Cancel' : 'More options'}
            </Typography>
          </Pressable>
        </View>
      )}

      {/* Status Display (when not pending) */}
      {dose.status !== 'pending' && (
        <View className={`px-4 pb-4 pt-0`}>
          <View className="flex-row items-center justify-center py-1">
            <Typography variant="body" className={`${config.labelColor} font-semibold`}>
              {config.label}
            </Typography>
          </View>
        </View>
      )}
    </View>
  );
}

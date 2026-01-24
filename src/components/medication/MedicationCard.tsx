import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui/Typography';
import { MealTimingBadge } from './MealTimingBadge';
import { Medication, ScheduleType } from '../../types';
import { getDependencyStatus } from '../../utils/schedule';
import { format } from 'date-fns';

interface MedicationCardProps {
  medication: Medication;
  allMedications?: Medication[];
  showChevron?: boolean;
}

const getScheduleLabel = (med: Medication): string => {
  if (med.scheduleType === 'as-needed') {
    return 'As needed';
  }

  const times = JSON.parse(med.scheduleTimes || '[]') as string[];
  if (times.length === 0) return 'No schedule';
  if (times.length === 1) return 'Once daily';
  if (times.length === 2) return 'Twice daily';
  return `${times.length}x daily`;
};

export function MedicationCard({ medication, allMedications = [], showChevron = false }: MedicationCardProps) {
  const scheduleLabel = getScheduleLabel(medication);
  const dependencyStatus = getDependencyStatus(medication, allMedications);
  const isAsNeeded = medication.scheduleType === 'as-needed';

  return (
    <View
      className="bg-white rounded-2xl p-4 border border-surface-100"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center">
        {/* Color indicator */}
        <View
          className="w-14 h-14 rounded-xl items-center justify-center mr-4"
          style={{ backgroundColor: medication.color + '15' }}
        >
          <Ionicons
            name={isAsNeeded ? 'flash' : 'medical'}
            size={26}
            color={medication.color}
          />
        </View>

        {/* Info */}
        <View className="flex-1">
          <View className="flex-row items-center mb-0.5">
            <Typography variant="h3" className="text-surface-900 font-semibold">
              {medication.name}
            </Typography>
            {isAsNeeded && (
              <View className="ml-2 px-2 py-0.5 bg-accent-100 rounded-full">
                <Typography variant="small" className="text-accent-600 font-medium text-xs">
                  PRN
                </Typography>
              </View>
            )}
          </View>
          <Typography variant="small" className="text-surface-500 mb-1.5">
            {medication.dosage} {medication.dosageUnit} · {scheduleLabel}
          </Typography>
          <View className="flex-row items-center flex-wrap gap-2">
            <MealTimingBadge timing={medication.mealTiming} size="sm" />

            {/* Duration badge */}
            {medication.endDate && (
              <View className="flex-row items-center px-2 py-0.5 bg-surface-100 rounded-full">
                <Ionicons name="calendar-outline" size={11} color="#737373" />
                <Typography variant="small" className="text-surface-500 ml-1 text-xs">
                  Until {format(new Date(medication.endDate), 'MMM d')}
                </Typography>
              </View>
            )}
          </View>
        </View>

        {/* Chevron */}
        {showChevron && (
          <Ionicons name="chevron-forward" size={22} color="#A3A3A3" />
        )}
      </View>

      {/* Dependency Status Banner */}
      {dependencyStatus.isWaiting && (
        <View className="mt-3 pt-3 border-t border-surface-100">
          <View className="flex-row items-center bg-violet-50 rounded-xl px-3 py-2.5">
            <View className="w-8 h-8 rounded-lg bg-violet-100 items-center justify-center mr-3">
              <Ionicons name="time-outline" size={16} color="#8B5CF6" />
            </View>
            <View className="flex-1">
              <Typography variant="small" className="text-violet-700 font-medium">
                Waiting to start
              </Typography>
              <Typography variant="small" className="text-violet-600/70 text-xs">
                {dependencyStatus.daysUntilStart
                  ? `Starts in ${dependencyStatus.daysUntilStart} day${dependencyStatus.daysUntilStart > 1 ? 's' : ''} after ${dependencyStatus.dependencyName}`
                  : `Starts after ${dependencyStatus.dependencyName} completes`
                }
              </Typography>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

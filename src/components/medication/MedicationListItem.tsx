import { Pressable, View } from 'react-native';
import { format } from 'date-fns';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { Badge } from '../ui/Badge';
import { Typography } from '../ui/Typography';
import { MealTimingBadge } from './MealTimingBadge';
import { colors } from '../../design/tokens';
import { Medication } from '../../types';
import { getDependencyStatus } from '../../utils/schedule';

interface MedicationListItemProps {
  medication: Medication;
  allMedications?: Medication[];
  onPress: () => void;
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

export function MedicationListItem({ medication, allMedications = [], onPress }: MedicationListItemProps) {
  const scheduleLabel = getScheduleLabel(medication);
  const dependencyStatus = getDependencyStatus(medication, allMedications);
  const isAsNeeded = medication.scheduleType === 'as-needed';

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`${medication.name} ${medication.dosage}`}
      accessibilityRole="button"
      accessibilityHint="Tap to view details"
    >
      <Card elevation="sm" bordered>
        <View className="flex-row items-start">
          {/* Icon container with color */}
          <View
            className="w-14 h-14 rounded-xl items-center justify-center mr-3.5"
            style={{ backgroundColor: medication.color + '15' }}
          >
            <Icon
              name={isAsNeeded ? 'bolt.fill' : 'pills.fill'}
              fallback={isAsNeeded ? 'flash' : 'medkit'}
              size="lg"
              color={medication.color}
            />
          </View>

          {/* Content */}
          <View className="flex-1">
            {/* Header row */}
            <View className="flex-row items-center justify-between mb-1">
              <Typography variant="h3" className="text-surface-900 font-semibold flex-1">
                {medication.name}
              </Typography>

              {/* PRN badge for as-needed */}
              {isAsNeeded && (
                <Badge
                  size="sm"
                  variant="warning"
                  label="PRN"
                  className="ml-2"
                />
              )}
            </View>

            {/* Dosage and schedule */}
            <Typography variant="small" className="text-surface-500 mb-2">
              {medication.dosage} {medication.dosageUnit} · {scheduleLabel}
            </Typography>

            {/* Badges row */}
            <View className="flex-row items-center flex-wrap gap-1.5">
              <MealTimingBadge timing={medication.mealTiming} size="sm" />

              {/* Duration badge if has end date */}
              {medication.endDate && (
                <Badge
                  size="sm"
                  variant="default"
                  label={`Until ${format(new Date(medication.endDate), 'MMM d')}`}
                  left={
                    <Icon
                      name="calendar"
                      fallback="calendar-outline"
                      size={12}
                      color={colors.surface[700]}
                    />
                  }
                />
              )}

              {/* Waiting to start badge */}
              {dependencyStatus.isWaiting && (
                <Badge
                  size="sm"
                  variant="primary"
                  label={`Starts in ${dependencyStatus.daysUntilStart || 0} day${(dependencyStatus.daysUntilStart || 0) > 1 ? 's' : ''}`}
                  left={
                    <Icon
                      name="clock"
                      fallback="time-outline"
                      size={12}
                      color={colors.primary[700]}
                    />
                  }
                />
              )}
            </View>
          </View>

          {/* Chevron */}
          <View className="ml-3 pt-1">
            <Icon
              name="chevron.right"
              fallback="chevron-forward"
              size="sm"
              color={colors.surface[300]}
            />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

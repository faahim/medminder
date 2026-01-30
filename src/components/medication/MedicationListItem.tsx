import { Pressable, View } from 'react-native';
import { format } from 'date-fns';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { Badge } from '../ui/Badge';
import { Typography } from '../ui/Typography';
import { MealTimingBadge } from './MealTimingBadge';
import { colors, radii, shadowsNative, spacing } from '../../design/tokens';
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
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          {/* Icon container with color */}
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: radii.md,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: spacing.md,
              backgroundColor: medication.color + '15',
              borderWidth: 1,
              borderColor: medication.color + '20',
            }}
          >
            <Icon
              name={isAsNeeded ? 'bolt.fill' : 'pills.fill'}
              fallback={isAsNeeded ? 'flash' : 'medkit'}
              size="lg"
              color={medication.color}
              weight="semibold"
            />
          </View>

          {/* Content */}
          <View style={{ flex: 1 }}>
            {/* Header row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs }}>
              <Typography variant="h3" style={{ color: colors.surface[900], fontWeight: '600', flex: 1 }}>
                {medication.name}
              </Typography>

              {/* PRN badge for as-needed */}
              {isAsNeeded && (
                <Badge
                  size="sm"
                  variant="warning"
                  label="PRN"
                  style={{ marginLeft: spacing.sm }}
                />
              )}
            </View>

            {/* Dosage and schedule */}
            <Typography variant="small" style={{ color: colors.surface[500], marginBottom: spacing.sm }}>
              {medication.dosage} {medication.dosageUnit} · {scheduleLabel}
            </Typography>

            {/* Badges row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.xs }}>
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

            {/* Dependency status banner */}
            {dependencyStatus.isWaiting && (
              <View
                style={{
                  marginTop: spacing.sm,
                  paddingTop: spacing.sm,
                  borderTopWidth: 1,
                  borderTopColor: colors.surface[100],
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.primary[50],
                    borderRadius: radii.md,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    gap: spacing.sm,
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: radii.sm,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.primary[100],
                    }}
                  >
                    <Icon
                      name="clock.fill"
                      fallback="time-outline"
                      size={14}
                      color={colors.primary[600]}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Typography variant="small" style={{ color: colors.primary[700], fontWeight: '600' }}>
                      Waiting to start
                    </Typography>
                    <Typography variant="small" style={{ color: colors.primary[600], fontSize: 11 }}>
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

          {/* Chevron */}
          <View style={{ marginLeft: spacing.sm, paddingTop: 2 }}>
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

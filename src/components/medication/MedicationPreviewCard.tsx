import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, shadowsNative } from '../../design/tokens';
import { Typography } from '../ui/Typography';
import { MealTimingBadge } from './MealTimingBadge';
import { MealTiming } from '../../types';

export interface MedicationPreviewCardProps {
  name?: string;
  dosage?: string;
  dosageUnit?: string;
  instructions?: string;
  scheduleType?: 'daily' | 'weekly' | 'interval' | 'as-needed';
  scheduleTimes?: string[];
  mealTiming?: MealTiming;
  color?: string;
  showSchedule?: boolean;
  showMeal?: boolean;
}

export function MedicationPreviewCard({
  name,
  dosage,
  dosageUnit,
  instructions,
  scheduleType,
  scheduleTimes,
  mealTiming,
  color = '#06B6D4',
  showSchedule = false,
  showMeal = false,
}: MedicationPreviewCardProps) {
  const hasBasicInfo = name || (dosage && dosageUnit);
  const hasInstructions = instructions && instructions.trim().length > 0;
  const hasSchedule = scheduleType || (scheduleTimes && scheduleTimes.length > 0);
  const hasMealTiming = mealTiming && mealTiming !== 'anytime';

  if (!hasBasicInfo && !hasInstructions && !hasSchedule && !hasMealTiming) {
    return null;
  }

  const formatSchedule = () => {
    if (scheduleType === 'as-needed') return 'As needed (PRN)';
    if (scheduleTimes && scheduleTimes.length > 0) {
      if (scheduleType === 'daily') return `Daily at ${scheduleTimes.join(', ')}`;
      if (scheduleType === 'interval') return `Every ${scheduleTimes.length} hours`;
      return scheduleTimes.join(', ');
    }
    return 'Set schedule';
  };

  return (
    <View style={[styles.container, shadowsNative.sm]}>
      {/* Header with name and color */}
      {hasBasicInfo && (
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: color }]}>
            <Ionicons name="medkit" size={20} color="white" />
          </View>
          <View style={styles.headerContent}>
            {name && (
              <Typography variant="h3" style={styles.name}>
                {name}
              </Typography>
            )}
            {dosage && dosageUnit && (
              <Typography variant="body" style={styles.dosage}>
                {dosage} {dosageUnit}
              </Typography>
            )}
          </View>
        </View>
      )}

      {/* Instructions */}
      {hasInstructions && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubble-outline" size={14} color={colors.surface[500]} />
            <Typography variant="small" style={styles.sectionLabel}>
              Instructions
            </Typography>
          </View>
          <Typography variant="small" style={styles.instructions}>
            {instructions}
          </Typography>
        </View>
      )}

      {/* Schedule */}
      {showSchedule && hasSchedule && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={14} color={colors.surface[500]} />
            <Typography variant="small" style={styles.sectionLabel}>
              Schedule
            </Typography>
          </View>
          <Typography variant="small" style={styles.schedule}>
            {formatSchedule()}
          </Typography>
        </View>
      )}

      {/* Meal timing */}
      {showMeal && hasMealTiming && mealTiming && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="restaurant-outline" size={14} color={colors.surface[500]} />
            <Typography variant="small" style={styles.sectionLabel}>
              Meal timing
            </Typography>
          </View>
          <MealTimingBadge timing={mealTiming} />
        </View>
      )}

      {/* Progress indicator */}
      <View style={styles.progressIndicator}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${((Number(!!name) + Number(!!dosage) + Number(showSchedule) + Number(showMeal)) / 4) * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderCurve: 'continuous',
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surface[100],
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  name: {
    color: colors.surface[900],
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  dosage: {
    color: colors.surface[500],
    fontSize: 14,
  },
  section: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surface[100],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  sectionLabel: {
    color: colors.surface[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  instructions: {
    color: colors.surface[700],
    fontSize: 13,
    lineHeight: 18,
  },
  schedule: {
    color: colors.surface[700],
    fontSize: 13,
  },
  progressIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.surface[100],
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
  },
});

import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors, radii } from '../../design/tokens';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
  style?: any;
}

/**
 * Shimmer Animation Hook
 *
 * Creates a smooth shimmer effect for loading states.
 */
function useShimmerAnimation() {
  const shimmer = useSharedValue(-1);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200 }),
      -1,
      true
    );
  }, [shimmer]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + shimmer.value * 0.4,
  }));

  return shimmerStyle;
}

/**
 * Skeleton
 *
 * Loading placeholder with shimmer animation.
 * Smooth, non-distracting animation that indicates loading state.
 */
export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  className = '',
  style,
}: SkeletonProps) {
  const shimmerStyle = useShimmerAnimation();

  return (
    <Animated.View
      className={`bg-surface-200 ${className}`}
      style={[
        {
          width: width as any,
          height,
          borderRadius,
        },
        shimmerStyle,
        style,
      ]}
    />
  );
}

/**
 * MedicationCardSkeleton
 *
 * Skeleton placeholder for medication card items.
 */
export function MedicationCardSkeleton() {
  return (
    <View style={styles.cardSkeleton}>
      <Skeleton width={48} height={48} borderRadius={24} />
      <View style={styles.skeletonContent}>
        <Skeleton width="60%" height={20} style={styles.skeletonLine1} />
        <Skeleton width="40%" height={16} />
      </View>
    </View>
  );
}

/**
 * DoseCardSkeleton
 *
 * Skeleton placeholder for dose card items.
 */
export function DoseCardSkeleton() {
  return (
    <View style={styles.doseCardSkeleton}>
      <View style={styles.doseHeader}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={styles.skeletonContent}>
          <Skeleton width="50%" height={18} style={styles.skeletonLine1} />
          <Skeleton width="30%" height={14} />
        </View>
      </View>
      <Skeleton width="100%" height={48} borderRadius={12} />
    </View>
  );
}

/**
 * TimelineSectionSkeleton
 *
 * Skeleton placeholder for timeline sections.
 */
export function TimelineSectionSkeleton() {
  return (
    <View style={styles.timelineSection}>
      <Skeleton width={120} height={24} style={styles.sectionHeader} />
      <View style={styles.timelineItems}>
        <DoseCardSkeleton />
        <DoseCardSkeleton />
      </View>
    </View>
  );
}

/**
 * StatsCardSkeleton
 *
 * Skeleton placeholder for stats cards.
 */
export function StatsCardSkeleton() {
  return (
    <View style={styles.statsCardSkeleton}>
      <Skeleton width="80%" height={16} style={styles.statsLabel} />
      <View style={styles.statsValueRow}>
        <Skeleton width={40} height={28} />
        <Skeleton width={24} height={24} borderRadius={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardSkeleton: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surface[200],
  },
  skeletonContent: {
    flex: 1,
    marginLeft: 12,
  },
  skeletonLine1: {
    marginBottom: 8,
  },
  doseCardSkeleton: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surface[200],
  },
  doseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timelineSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  timelineItems: {
    gap: 12,
  },
  statsCardSkeleton: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surface[200],
  },
  statsLabel: {
    marginBottom: 8,
  },
  statsValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

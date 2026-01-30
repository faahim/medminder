import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, radii } from '../../design/tokens';
import { Typography } from './Typography';

export interface AdherenceDataPoint {
  dayLabel: string; // 'M', 'T', 'W', etc.
  adherencePercent: number;
  hasData: boolean;
}

export interface AdherenceChartProps {
  data: AdherenceDataPoint[];
  height?: number;
  barWidth?: number;
  showLabels?: boolean;
}

export function AdherenceChart({
  data,
  height = 120,
  barWidth = 28,
  showLabels = true,
}: AdherenceChartProps) {
  const getBarColor = (percent: number, hasData: boolean) => {
    if (!hasData) return colors.surface[200];
    if (percent >= 90) return colors.success[500];
    if (percent >= 60) return colors.primary[400];
    if (percent >= 40) return colors.warning[500];
    return colors.error[500];
  };

  const maxBarHeight = height - (showLabels ? 24 : 8); // Account for labels

  return (
    <View style={[styles.container, { height }]}>
      {data.map((point, index) => {
        const barHeight = point.hasData ? (point.adherencePercent / 100) * maxBarHeight : 4;
        const barColor = getBarColor(point.adherencePercent, point.hasData);

        return (
          <View key={index} style={[styles.barContainer, { width: barWidth }]}>
            <View
              style={[
                styles.bar,
                {
                  height: barHeight,
                  backgroundColor: barColor,
                  borderRadius: radii.sm,
                },
              ]}
            />
            {showLabels && (
              <Typography variant="small" style={styles.label}>
                {point.dayLabel}
              </Typography>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    minHeight: 4,
    borderTopLeftRadius: radii.sm,
    borderTopRightRadius: radii.sm,
    // Subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    marginTop: spacing.xs,
    color: colors.surface[500],
    fontSize: 11,
    fontWeight: '500',
  },
});

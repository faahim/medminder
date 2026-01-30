import * as React from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isToday } from 'date-fns';
import { colors, radii, spacing, iconSizes } from '../../design/tokens';
import { Typography } from './Typography';
import { Icon } from './Icon';

export interface WeekDay {
  date: Date;
  dayName: string;
  dayNumber: string;
  isSelected: boolean;
  isToday: boolean;
  completionRate: number; // 0-100
}

export interface WeekStripProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  weekData: Map<string, number>; // Date string -> completion rate (0-100)
  onPreviousWeek?: () => void;
  onNextWeek?: () => void;
}

export function WeekStrip({
  selectedDate,
  onDateSelect,
  weekData,
  onPreviousWeek,
  onNextWeek,
}: WeekStripProps) {
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Generate week days (7 days centered around selected date or current week)
  const weekDays = React.useMemo(() => {
    const days: WeekDay[] = [];
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 }); // Sunday start

    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const completionRate = weekData.get(dateStr) ?? 0;

      days.push({
        date,
        dayName: format(date, 'EEE').toUpperCase(),
        dayNumber: format(date, 'd'),
        isSelected: isSameDay(date, selectedDate),
        isToday: isToday(date),
        completionRate,
      });
    }

    return days;
  }, [selectedDate, weekData]);

  // Scroll to selected day on mount or when it changes
  React.useEffect(() => {
    const selectedIndex = weekDays.findIndex((day) => day.isSelected);
    if (selectedIndex !== -1 && scrollViewRef.current) {
      const itemWidth = 50; // Width of each day item
      const scrollPosition = selectedIndex * itemWidth - 100;
      scrollViewRef.current.scrollTo({ x: Math.max(0, scrollPosition), animated: true });
    }
  }, [weekDays]);

  const getCompletionColor = (rate: number) => {
    if (rate >= 90) return colors.success[500];
    if (rate >= 60) return colors.warning[500];
    return colors.error[500];
  };

  const handleDayPress = (day: WeekDay) => {
    onDateSelect(day.date);
  };

  return (
    <View style={styles.container}>
      {/* Navigation */}
      <View style={styles.header}>
        <Pressable
          onPress={onPreviousWeek}
          style={styles.navButton}
          hitSlop={8}
        >
          <Icon name="chevron.left" fallback="chevron-back" size="md" color={colors.surface[700]} />
        </Pressable>
        <Typography variant="h3" style={styles.monthYear}>
          {format(selectedDate, 'MMMM yyyy')}
        </Typography>
        <Pressable
          onPress={onNextWeek}
          style={styles.navButton}
          hitSlop={8}
        >
          <Icon name="chevron.right" fallback="chevron-forward" size="md" color={colors.surface[700]} />
        </Pressable>
      </View>

      {/* Week Strip */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        pagingEnabled={false}
        decelerationRate="fast"
        snapToInterval={50}
      >
        {weekDays.map((day, index) => (
          <Pressable
            key={index}
            onPress={() => handleDayPress(day)}
            style={[
              styles.dayItem,
              day.isSelected && styles.dayItemSelected,
            ]}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityState={{ selected: day.isSelected }}
            accessibilityLabel={`${day.dayName} ${day.dayNumber}${day.isToday ? ', Today' : ''}${day.completionRate > 0 ? `, ${day.completionRate}% complete` : ''}`}
          >
            <Typography
              variant="small"
              style={[
                styles.dayName,
                day.isSelected ? styles.dayNameSelected : {},
              ]}
            >
              {day.dayName}
            </Typography>
            <Typography
              variant="h3"
              style={[
                styles.dayNumber,
                day.isSelected ? styles.dayNumberSelected : {},
              ]}
            >
              {day.dayNumber}
            </Typography>
            {/* Completion Dot */}
            <View
              style={[
                styles.completionDot,
                day.completionRate > 0 && { backgroundColor: getCompletionColor(day.completionRate) },
              ]}
            />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface[200],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  monthYear: {
    fontWeight: '600',
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface[100],
  },
  scrollContent: {
    paddingHorizontal: spacing.xs,
  },
  dayItem: {
    width: 50,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.lg,
    marginHorizontal: 2,
  },
  dayItemSelected: {
    backgroundColor: colors.primary[100],
  },
  dayName: {
    color: colors.surface[500],
    fontSize: 11,
    marginBottom: 2,
  },
  dayNameSelected: {
    color: colors.primary[600],
  },
  dayNumber: {
    color: colors.surface[900],
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayNumberSelected: {
    color: colors.primary[600],
  },
  completionDot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.surface[300],
    marginTop: 2,
  },
});

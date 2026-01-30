import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Pressable, ScrollView, RefreshControl } from 'react-native';
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isToday } from 'date-fns';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';

import { DoseLogService } from '../../src/services/doseLog.service';
import { MedicationService } from '../../src/services/medication.service';
import { DayAggregate, DoseLog, Medication } from '../../src/types';
import { Typography } from '../../src/components/ui/Typography';
import { Card } from '../../src/components/ui/Card';
import { Icon } from '../../src/components/ui/Icon';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { LoadingState } from '../../src/components/ui/LoadingState';
import { WeekStrip } from '../../src/components/ui/WeekStrip';
import { AdherenceChart } from '../../src/components/ui/AdherenceChart';
import { DoseHistoryItem } from '../../src/components/medication/DoseHistoryItem';
import { DatePickerModal } from '../../src/components/ui/DatePickerModal';
import { Screen } from '../../src/components/layout/Screen';
import { colors, spacing, radii, animation } from '../../src/design/tokens';

// Animated View wrapper
const AnimatedView = Animated.View;

export default function HistoryScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekData, setWeekData] = useState<Map<string, number>>(new Map());
  const [dayLogs, setDayLogs] = useState<(DoseLog & { medication?: Medication })[]>([]);
  const [dayAggregate, setDayAggregate] = useState<DayAggregate | null>(null);
  const [medications, setMedications] = useState<Map<string, Medication>>(new Map());
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [weeklyData, setWeeklyData] = useState<Array<{ dayLabel: string; adherencePercent: number; hasData: boolean }>>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const fadeValue = useSharedValue(0);
  const slideValue = useSharedValue(20);

  // Initial data load
  useEffect(() => {
    loadMedications();
  }, []);

  // Load medications
  const loadMedications = async () => {
    try {
      const meds = await MedicationService.getAll();
      const map = new Map<string, Medication>();
      for (const med of meds) map.set(med.id, med);
      setMedications(map);
    } catch (error) {
      // Error loading medications
    }
  };

  // Load all data
  const loadAllData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadWeekData(selectedDate),
        loadStreaks(),
      ]);
      if (medications.size > 0) {
        await loadDayDetails(selectedDate);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reload for refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  // Load week data
  const loadWeekData = useCallback(async (date: Date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 0 });

    const aggregates = await DoseLogService.getAggregatesForRange(
      format(weekStart, 'yyyy-MM-dd'),
      format(weekEnd, 'yyyy-MM-dd')
    );

    const data = new Map<string, number>();
    for (const agg of aggregates) {
      data.set(agg.date, agg.adherencePercent);
    }
    setWeekData(data);

    // Also update weekly chart data
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const chartData = days.map((dayLabel, i) => {
      const d = addDays(weekStart, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const agg = aggregates.find(a => a.date === dateStr);
      return {
        dayLabel,
        adherencePercent: agg?.adherencePercent ?? 0,
        hasData: agg ? agg.totalDoses > 0 : false,
      };
    });
    setWeeklyData(chartData);
  }, []);

  // Load day details
  const loadDayDetails = useCallback(async (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const logs = await DoseLogService.getDosesForDate(dateStr);
    const aggregate = await DoseLogService.getDayAggregate(dateStr);

    const enrichedLogs = logs.map((log) => ({
      ...log,
      medication: medications.get(log.medicationId),
    }));

    setDayLogs(enrichedLogs);
    setDayAggregate(aggregate);

    // Animate content change
    fadeValue.value = 0;
    slideValue.value = 10;
    fadeValue.value = withTiming(1, { duration: animation.fast });
    slideValue.value = withTiming(0, { duration: animation.fast });
  }, [medications, fadeValue, slideValue]);

  // Load streaks
  const loadStreaks = useCallback(async () => {
    const [current, best] = await Promise.all([
      DoseLogService.getCurrentStreak(selectedDate),
      DoseLogService.getBestStreak(),
    ]);
    setCurrentStreak(current);
    setBestStreak(best);
  }, [selectedDate]);

  // Load all data when date changes
  useEffect(() => {
    if (!isLoading) {
      loadWeekData(selectedDate);
      loadStreaks();
    }
  }, [selectedDate, isLoading, loadWeekData, loadStreaks]);

  useEffect(() => {
    if (!isLoading && medications.size > 0) {
      loadDayDetails(selectedDate);
    }
  }, [selectedDate, medications, isLoading, loadDayDetails]);

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // Handle week navigation
  const handlePreviousWeek = () => {
    setSelectedDate(subWeeks(selectedDate, 1));
  };

  const handleNextWeek = () => {
    setSelectedDate(addWeeks(selectedDate, 1));
  };

  // Handle date picker
  const handleDatePickerChange = (date: Date) => {
    setSelectedDate(date);
  };

  // Animated styles
  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeValue.value,
    transform: [{ translateY: slideValue.value }],
  }));

  const getOverallAdherence = useCallback(() => {
    if (!dayAggregate) return 0;
    return dayAggregate.adherencePercent;
  }, [dayAggregate]);

  const overallAdherence = getOverallAdherence();
  const hasDoses = dayAggregate && dayAggregate.totalDoses > 0;

  // Check if there's any history data at all
  const hasNoHistory = weekData.size === 0 && currentStreak === 0 && bestStreak === 0 && !isLoading;

  return (
    <View style={styles.container}>
      <Screen
        scroll
        includeTopInset={false}
        padX={0}
        padY={0}
        padBottomExtra={100}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
          />
        }
      >
        {/* Week Strip */}
        <WeekStrip
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          weekData={weekData}
          onPreviousWeek={handlePreviousWeek}
          onNextWeek={handleNextWeek}
        />

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* No history empty state */}
          {hasNoHistory ? (
            <Animated.View entering={FadeIn.delay(200).springify()}>
              <EmptyState
                sfSymbol="chart.bar"
                fallbackIcon="bar-chart"
                title="No history yet"
                subtitle="Your medication history will appear here as you take your doses"
                variant="surface"
              />
            </Animated.View>
          ) : (
            <>
              {/* Date Header with Picker */}
              <AnimatedView entering={FadeIn.delay(100).springify()} style={styles.dateHeader}>
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateButton}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Select date, currently ${format(selectedDate, 'MMMM d, yyyy')}`}
                >
                  <Typography variant="h2" style={styles.dateText}>
                    {format(selectedDate, 'EEEE, MMMM d')}
                  </Typography>
                  <Icon name="calendar" fallback="calendar-outline" size="sm" color={colors.primary[500]} />
                </Pressable>
              </AnimatedView>

              {/* Stats Cards */}
              <AnimatedView>
                <AnimatedView entering={FadeInDown.delay(150).springify()} style={styles.statsRow}>
                  <Card elevation="none" style={styles.statsCard}>
                    <Typography variant="small" style={styles.statsLabel}>
                      Adherence
                    </Typography>
                    <View style={styles.statsValueContainer}>
                      <Typography variant="display" style={styles.statsValue}>
                        {overallAdherence}%
                      </Typography>
                      <Icon
                        name="chart.line.uptrend.xyaxis"
                        fallback="trending-up"
                        size="md"
                        color={overallAdherence >= 80 ? colors.success[500] : overallAdherence >= 50 ? colors.warning[500] : colors.error[500]}
                      />
                    </View>
                  </Card>

                  <Card elevation="none" style={styles.statsCard}>
                    <Typography variant="small" style={styles.statsLabel}>
                      Current Streak
                    </Typography>
                    <View style={styles.statsValueContainer}>
                      <Typography variant="display" style={styles.statsValue}>
                        {currentStreak}
                      </Typography>
                      <Icon name="flame.fill" fallback="flame" size="md" color={colors.warning[500]} />
                    </View>
                  </Card>

                  <Card elevation="none" style={styles.statsCard}>
                    <Typography variant="small" style={styles.statsLabel}>
                      Best Streak
                    </Typography>
                    <View style={styles.statsValueContainer}>
                      <Typography variant="display" style={styles.statsValue}>
                        {bestStreak}
                      </Typography>
                      <Icon name="star.fill" fallback="star" size="md" color={colors.warning[500]} />
                    </View>
                  </Card>
                </AnimatedView>

                {/* Weekly Adherence Chart */}
                <AnimatedView entering={FadeInDown.delay(200).springify()} style={styles.chartSection}>
                  <Typography variant="h3" style={styles.chartTitle}>
                    This Week
                  </Typography>
                  <Card elevation="sm" style={styles.chartCard}>
                    <AdherenceChart data={weeklyData} height={100} />
                  </Card>
                </AnimatedView>

                {/* Day Log */}
                <AnimatedView style={[styles.logSection, fadeStyle]}>
                  <Typography variant="h3" style={styles.logTitle}>
                    {isToday(selectedDate) ? 'Today' : 'Day Log'}
                  </Typography>

                  {hasDoses && dayLogs.length > 0 ? (
                    <Card elevation="sm" style={styles.logCard}>
                      {dayLogs.map((log, index) => (
                        <Animated.View
                          key={log.id}
                          entering={FadeIn.delay(index * 50).springify()}
                          layout={Animated.springify().damping(15).stiffness(200)}
                        >
                          <DoseHistoryItem
                            doseLog={log}
                            isLast={index === dayLogs.length - 1}
                          />
                        </Animated.View>
                      ))}
                    </Card>
                  ) : hasDoses && dayLogs.length === 0 ? (
                    <Card elevation="sm" style={styles.emptyCard}>
                      <View style={styles.emptyContent}>
                        <View style={styles.emptyIcon}>
                          <Icon name="clock.badge.questionmark" fallback="help-circle" size="xl" color={colors.surface[300]} />
                        </View>
                        <Typography variant="body" style={styles.emptyText}>
                          No dose logs yet
                        </Typography>
                        <Typography variant="small" style={styles.emptySubtext}>
                          Doses will appear here when scheduled
                        </Typography>
                      </View>
                    </Card>
                  ) : (
                    <Card elevation="sm" style={styles.emptyCard}>
                      <View style={styles.emptyContent}>
                        <View style={styles.emptyIcon}>
                          <Icon name="calendar.badge.plus" fallback="calendar" size="xl" color={colors.surface[300]} />
                        </View>
                        <Typography variant="body" style={styles.emptyText}>
                          No medications scheduled
                        </Typography>
                        <Typography variant="small" style={styles.emptySubtext}>
                          This day has no scheduled doses
                        </Typography>
                      </View>
                    </Card>
                  )}
                </AnimatedView>
              </AnimatedView>
            </>
          )}
        </ScrollView>

        {/* Date Picker Modal */}
        <DatePickerModal
          visible={showDatePicker}
          date={selectedDate}
          onDateChange={handleDatePickerChange}
          onClose={() => setShowDatePicker(false)}
          maximumDate={new Date()}
          title="Go to Date"
        />
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface[50],
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  dateHeader: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateText: {
    color: colors.surface[900],
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statsCard: {
    flex: 1,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surface[200],
  },
  statsLabel: {
    color: colors.surface[500],
    marginBottom: spacing.sm,
  },
  statsValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.surface[900],
    lineHeight: 28,
  },
  chartSection: {
    marginBottom: spacing.lg,
  },
  chartTitle: {
    color: colors.surface[900],
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  chartCard: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surface[200],
  },
  logSection: {
    marginBottom: spacing.xl,
  },
  logTitle: {
    color: colors.surface[900],
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  logCard: {
    borderWidth: 1,
    borderColor: colors.surface[200],
  },
  emptyCard: {
    padding: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.surface[200],
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: radii.xl,
    backgroundColor: colors.surface[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyText: {
    color: colors.surface[900],
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    color: colors.surface[500],
  },
});

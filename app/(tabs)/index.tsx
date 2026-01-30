import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { TAB_BAR_BASE_HEIGHT } from '../../src/constants/layout';
import { useTodaysDoses } from '../../src/hooks/useTodaysDoses';
import { useStaggeredAnimation } from '../../src/hooks/useStaggeredAnimation';

import { Screen } from '../../src/components/layout/Screen';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Typography } from '../../src/components/ui/Typography';
import { Card } from '../../src/components/ui/Card';
import { Icon } from '../../src/components/ui/Icon';
import { LoadingState } from '../../src/components/ui/LoadingState';

import { DoseCard } from '../../src/components/medication/DoseCard';
import { AsNeededCard } from '../../src/components/medication/AsNeededCard';

import { colors, radii, shadows, spacing } from '../../src/design';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { doses, isLoading, refresh, groupedDoses, logDose, asNeededMeds, logAsNeededDose } = useTodaysDoses();
  const [refreshing, setRefreshing] = useState(false);

  const fabScale = useSharedValue(1);
  const fabAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: fabScale.value }] }));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleLogDose = useCallback(
    async (
      medicationId: string,
      _scheduledDate: string,
      scheduledTime: string,
      status: 'taken' | 'skipped' | 'pending' | 'missed'
    ) => {
      await logDose(medicationId, scheduledTime, status);
    },
    [logDose]
  );

  const today = new Date();
  const dayName = format(today, 'EEEE');
  const dateStr = format(today, 'MMMM d');

  const totalScheduled = doses.length;
  const completed = doses.filter((d) => d.status === 'taken' || d.status === 'skipped').length;
  const progressPercent = totalScheduled > 0 ? Math.round((completed / totalScheduled) * 100) : 0;

  const hasScheduledDoses = doses.length > 0;
  const hasAsNeededMeds = asNeededMeds && asNeededMeds.length > 0;
  const isEmpty = !hasScheduledDoses && !hasAsNeededMeds && !isLoading;

  const renderTimeSection = (
    title: string,
    sectionDoses: typeof doses,
    icon: Parameters<typeof Icon>[0]['name'],
    sectionIndex: number
  ) => {
    if (sectionDoses.length === 0) return null;

    const baseDelay = 200 + sectionIndex * 100;

    return (
      <Animated.View entering={FadeInUp.delay(baseDelay).springify()} style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: radii.md,
              backgroundColor: colors.primary[100],
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: spacing.sm,
            }}
          >
            <Icon name={icon} fallback="time-outline" size={18} color={colors.primary[600]} />
          </View>
          <Typography variant="label" style={{ color: colors.surface[500], textTransform: 'uppercase', letterSpacing: 1.2 }}>
            {title}
          </Typography>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.surface[200], marginLeft: spacing.md }} />
        </View>

        {sectionDoses.map((dose, idx) => (
          <Animated.View
            key={`${dose.medication.id}-${dose.scheduledTime}`}
            entering={useStaggeredAnimation(idx, 30, 'up')}
            layout={Animated.springify().damping(15).stiffness(200)}
          >
            <DoseCard
              dose={dose}
              onLogDose={handleLogDose}
              onStatusChange={refresh}
            />
          </Animated.View>
        ))}
      </Animated.View>
    );
  };

  let asNeededDelay = 600;
  const asNeededSectionIndex = Object.values(groupedDoses).filter((d) => d.length > 0).length;

  // Loading state
  if (isLoading && !hasScheduledDoses && !hasAsNeededMeds) {
    return (
      <View className="flex-1 bg-surface-50">
        <Screen scroll padX={16} padY={16} padBottomExtra={120}>
          <LoadingState message="Loading your medications..." sfSymbol="pills" fallbackIcon="medkit-outline" />
        </Screen>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-50">
      <Screen
        scroll
        padX={16}
        padY={16}
        padBottomExtra={120}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />}
        contentContainerStyle={{ flexGrow: 1, gap: spacing.lg }}
      >
        {/* Premium hero */}
        <Animated.View entering={FadeIn.duration(300).springify()}>
          <View
            style={{
              borderRadius: radii.xl,
              overflow: 'hidden',
              borderCurve: 'continuous' as any,
              boxShadow: shadows.md as any,
            }}
          >
            <LinearGradient
              colors={[colors.primary[600], colors.primary[500]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: spacing.lg }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Typography variant="small" style={{ color: 'rgba(255,255,255,0.78)', marginBottom: 6 }}>
                    {dayName}
                  </Typography>
                  <Typography
                    variant="h1"
                    style={{ color: colors.white, fontWeight: '700', letterSpacing: -0.3, marginBottom: 10 }}
                  >
                    {dateStr}
                  </Typography>

                  {hasScheduledDoses ? (
                    <View style={{ gap: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="small" style={{ color: 'rgba(255,255,255,0.82)' }}>
                          {completed} of {totalScheduled} complete
                        </Typography>
                        <Typography variant="small" style={{ color: 'rgba(255,255,255,0.92)', fontWeight: '700' }}>
                          {progressPercent}%
                        </Typography>
                      </View>

                      <View
                        style={{
                          height: 10,
                          borderRadius: radii.full,
                          backgroundColor: 'rgba(255,255,255,0.24)',
                          overflow: 'hidden',
                        }}
                      >
                        <View
                          style={{
                            width: `${progressPercent}%`,
                            height: '100%',
                            borderRadius: radii.full,
                            backgroundColor: 'rgba(255,255,255,0.92)',
                          }}
                        />
                      </View>
                    </View>
                  ) : (
                    <Typography variant="body" style={{ color: 'rgba(255,255,255,0.82)', maxWidth: 260 }}>
                      Add a medication to start tracking your day.
                    </Typography>
                  )}
                </View>

                {hasScheduledDoses ? (
                  <View
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: 38,
                      backgroundColor: 'rgba(255,255,255,0.18)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.22)',
                    }}
                  >
                    <View
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: 27,
                        backgroundColor: colors.white,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="h3" style={{ color: colors.primary[700], fontWeight: '800' }}>
                        {progressPercent}%
                      </Typography>
                    </View>
                  </View>
                ) : null}
              </View>

              {hasScheduledDoses ? (
                <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
                  <View
                    style={{
                      flex: 1,
                      padding: spacing.md,
                      borderRadius: radii.lg,
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.16)',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                      <Icon name="checkmark.circle.fill" fallback="checkmark-circle" size={16} color={'rgba(255,255,255,0.92)'} />
                      <Typography variant="small" style={{ color: 'rgba(255,255,255,0.82)' }}>
                        Taken
                      </Typography>
                    </View>
                    <Typography variant="h3" style={{ color: colors.white, fontWeight: '800', marginTop: 6 }}>
                      {doses.filter((d) => d.status === 'taken').length}
                    </Typography>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      padding: spacing.md,
                      borderRadius: radii.lg,
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.16)',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                      <Icon name="clock.fill" fallback="time-outline" size={16} color={'rgba(255,255,255,0.92)'} />
                      <Typography variant="small" style={{ color: 'rgba(255,255,255,0.82)' }}>
                        Remaining
                      </Typography>
                    </View>
                    <Typography variant="h3" style={{ color: colors.white, fontWeight: '800', marginTop: 6 }}>
                      {doses.filter((d) => d.status === 'pending').length}
                    </Typography>
                  </View>
                </View>
              ) : null}
            </LinearGradient>
          </View>
        </Animated.View>

        {isEmpty ? (
          <Animated.View entering={FadeInUp.delay(400).springify()}>
            <EmptyState
              sfSymbol="pills"
              fallbackIcon="medkit-outline"
              title="No medications yet"
              subtitle="Add your first medication to start tracking your doses"
              actionLabel="Add Medication"
              actionHref="/medication/add"
              variant="primary"
            />
          </Animated.View>
        ) : (
          <>
            {hasScheduledDoses ? (
              <View style={{ gap: spacing.lg }}>
                {renderTimeSection('Morning', groupedDoses.morning, 'sun.max.fill', 0)}
                {renderTimeSection('Afternoon', groupedDoses.afternoon, 'sun.and.horizon.fill', 1)}
                {renderTimeSection('Evening', groupedDoses.evening, 'moon.stars.fill', 2)}
                {renderTimeSection('Night', groupedDoses.night, 'moon.zzz.fill', 3)}
              </View>
            ) : null}

            {hasAsNeededMeds ? (
              <Animated.View
                entering={FadeInUp.delay(asNeededSectionIndex * 100 + 400).springify()}
                style={{ gap: spacing.sm }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: radii.md,
                      backgroundColor: colors.warning[100],
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: spacing.sm,
                    }}
                  >
                    <Icon name="bolt.fill" fallback="flash-outline" size={18} color={colors.warning[600]} />
                  </View>
                  <Typography variant="label" style={{ color: colors.surface[500], textTransform: 'uppercase', letterSpacing: 1.2 }}>
                    As needed
                  </Typography>
                  <View style={{ flex: 1, height: 1, backgroundColor: colors.surface[200], marginLeft: spacing.md }} />
                </View>

                <View style={{ gap: spacing.sm }}>
                  {asNeededMeds.map((med, idx) => (
                    <Animated.View
                      key={med.id}
                      entering={useStaggeredAnimation(idx, 30, 'up')}
                      layout={Animated.springify().damping(15).stiffness(200)}
                    >
                      <AsNeededCard key={med.id} medication={med} onLogDose={logAsNeededDose} />
                    </Animated.View>
                  ))}
                </View>
              </Animated.View>
            ) : null}

            {hasScheduledDoses && completed === totalScheduled && progressPercent === 100 ? (
              <Animated.View entering={FadeInUp.delay(500).springify()}>
                <EmptyState
                  sfSymbol="checkmark.seal.fill"
                  fallbackIcon="checkmark-circle"
                  title="All done for today!"
                  subtitle="Great job staying on track. Come back tomorrow!"
                  variant="success"
                />
              </Animated.View>
            ) : null}
          </>
        )}
      </Screen>

      {!isEmpty && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              right: 24,
              bottom: TAB_BAR_BASE_HEIGHT + insets.bottom + 16,
            },
            fabAnimStyle,
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add medication"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/medication/add');
            }}
            onPressIn={() => {
              fabScale.value = withSpring(0.96, { damping: 12, stiffness: 400 });
            }}
            onPressOut={() => {
              fabScale.value = withSpring(1, { damping: 12, stiffness: 400 });
            }}
            style={{
              borderRadius: 28,
              overflow: 'hidden',
              boxShadow: shadows.lg as any,
            }}
          >
            <LinearGradient
              colors={[colors.primary[500], colors.primary[600]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="plus" fallback="add" size={26} color={colors.white} weight="bold" />
            </LinearGradient>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

import { View, RefreshControl, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_BASE_HEIGHT } from '../../src/constants/layout';
import { useCallback, useState } from 'react';
import { router } from 'expo-router';
import { useTodaysDoses } from '../../src/hooks/useTodaysDoses';
import { Typography } from '../../src/components/ui/Typography';
import { DoseCard } from '../../src/components/medication/DoseCard';
import { AsNeededCard } from '../../src/components/medication/AsNeededCard';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppHeader } from '../../src/components/layout/AppHeader';
import { Screen } from '../../src/components/layout/Screen';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { doses, isLoading, refresh, groupedDoses, logDose, asNeededMeds, logAsNeededDose } = useTodaysDoses();
  const [refreshing, setRefreshing] = useState(false);

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

  const renderTimeSection = (title: string, sectionDoses: typeof doses, icon: string) => {
    if (sectionDoses.length === 0) return null;

    return (
      <View className="mb-6">
        <View className="flex-row items-center mb-3">
          <View className="w-8 h-8 rounded-xl bg-primary-100 items-center justify-center mr-2">
            <Ionicons name={icon as any} size={16} color="#06B6D4" />
          </View>
          <Typography variant="label" className="text-surface-500 uppercase tracking-wider">
            {title}
          </Typography>
          <View className="flex-1 h-px bg-surface-200 ml-3" />
        </View>
        {sectionDoses.map((dose) => (
          <DoseCard
            key={`${dose.medication.id}-${dose.scheduledTime}`}
            dose={dose}
            onLogDose={handleLogDose}
            onStatusChange={refresh}
          />
        ))}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-surface-50">
      <AppHeader
        title={dateStr}
        subtitle={dayName}
        variant="gradient"
        right={
          hasScheduledDoses ? (
            <View className="items-center">
              <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center">
                <View className="w-12 h-12 rounded-full bg-white items-center justify-center">
                  <Typography variant="h3" className="text-primary-700 font-bold">
                    {progressPercent}%
                  </Typography>
                </View>
              </View>
              <Typography variant="small" className="text-primary-100 mt-1">
                {completed}/{totalScheduled}
              </Typography>
            </View>
          ) : null
        }
        bottomSlot={
          hasScheduledDoses ? (
            <View className="flex-row">
              <View className="flex-1 bg-white/10 rounded-2xl p-3.5 mr-2">
                <View className="flex-row items-center">
                  <View className="w-6 h-6 rounded-full bg-success-400/30 items-center justify-center mr-2">
                    <Ionicons name="checkmark" size={14} color="#4ADE80" />
                  </View>
                  <Typography variant="small" className="text-white/85">
                    Taken
                  </Typography>
                </View>
                <Typography variant="h3" className="text-white font-bold mt-1">
                  {doses.filter((d) => d.status === 'taken').length}
                </Typography>
              </View>
              <View className="flex-1 bg-white/10 rounded-2xl p-3.5 ml-2">
                <View className="flex-row items-center">
                  <View className="w-6 h-6 rounded-full bg-warning-400/30 items-center justify-center mr-2">
                    <Ionicons name="time-outline" size={14} color="#FBBF24" />
                  </View>
                  <Typography variant="small" className="text-white/85">
                    Remaining
                  </Typography>
                </View>
                <Typography variant="h3" className="text-white font-bold mt-1">
                  {doses.filter((d) => d.status === 'pending').length}
                </Typography>
              </View>
            </View>
          ) : null
        }
      />

      <Screen
        scroll
        includeTopInset={false}
        padX={16}
        padY={16}
        padBottomExtra={100}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#06B6D4" />}
        contentContainerStyle={{ flexGrow: 1 }}
      >

        {isEmpty ? (
          <EmptyState
            icon="medkit-outline"
            title="No medications yet"
            subtitle="Add your first medication to start tracking your doses"
            actionLabel="Add Medication"
            actionHref="/medication/add"
          />
        ) : (
          <>
            {hasScheduledDoses ? (
              <>
                {renderTimeSection('Morning', groupedDoses.morning, 'sunny-outline')}
                {renderTimeSection('Afternoon', groupedDoses.afternoon, 'partly-sunny-outline')}
                {renderTimeSection('Evening', groupedDoses.evening, 'cloudy-night-outline')}
                {renderTimeSection('Night', groupedDoses.night, 'moon-outline')}
              </>
            ) : null}

            {hasAsNeededMeds ? (
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 rounded-xl bg-accent-100 items-center justify-center mr-2">
                    <Ionicons name="flash-outline" size={16} color="#F97316" />
                  </View>
                  <Typography variant="label" className="text-surface-500 uppercase tracking-wider">
                    As Needed
                  </Typography>
                  <View className="flex-1 h-px bg-surface-200 ml-3" />
                </View>

                {asNeededMeds.map((med) => (
                  <AsNeededCard key={med.id} medication={med} onLogDose={logAsNeededDose} />
                ))}
              </View>
            ) : null}

            {hasScheduledDoses && completed === totalScheduled ? (
              <View className="bg-success-50 rounded-3xl p-6 items-center">
                <View className="w-16 h-16 rounded-full bg-success-100 items-center justify-center mb-3">
                  <Ionicons name="checkmark-done" size={32} color="#22C55E" />
                </View>
                <Typography variant="h3" className="text-success-700 font-semibold">
                  All done for today!
                </Typography>
                <Typography variant="small" className="text-success-600/80 text-center mt-1">
                  You’ve taken all your scheduled medications
                </Typography>
              </View>
            ) : null}
          </>
        )}
      </Screen>

      {/* Floating Action Button (hide when empty to avoid duplicate CTAs) */}
      {!isEmpty && (
        <Pressable
          onPress={() => router.push('/medication/add')}
          className="absolute right-6"
          style={{ bottom: TAB_BAR_BASE_HEIGHT + insets.bottom + 16, shadowColor: '#06B6D4', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 10 }}
        >
          <LinearGradient colors={['#06B6D4', '#0891B2']} className="w-14 h-14 rounded-full items-center justify-center">
            <Ionicons name="add" size={28} color="#fff" />
          </LinearGradient>
        </Pressable>
      )}
    </View>
  );
}

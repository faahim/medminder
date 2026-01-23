import { View, ScrollView, RefreshControl } from 'react-native';
import { useCallback, useState } from 'react';
import { useTodaysDoses } from '../../src/hooks/useTodaysDoses';
import { Typography } from '../../src/components/ui/Typography';
import { DoseCard } from '../../src/components/medication/DoseCard';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { format } from 'date-fns';

export default function HomeScreen() {
  const { doses, isLoading, refresh, groupedDoses, logDose } = useTodaysDoses();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // Create wrapper function for DoseCard's onLogDose prop
  const handleLogDose = useCallback(async (
    medicationId: string,
    scheduledDate: string,
    scheduledTime: string,
    status: 'taken' | 'skipped' | 'pending' | 'missed'
  ) => {
    await logDose(medicationId, scheduledTime, status);
  }, [logDose]);

  const today = new Date();
  const dayName = format(today, 'EEEE');
  const dateStr = format(today, 'MMMM d');

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-6 pt-14 pb-4 shadow-sm">
        <Typography variant="body" className="text-gray-500 dark:text-gray-400">
          {dayName}
        </Typography>
        <Typography variant="h1" className="text-gray-900 dark:text-white">
          {dateStr}
        </Typography>
      </View>

      {/* Timeline */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {doses.length === 0 && !isLoading ? (
          <EmptyState
            icon="medkit"
            title="No medications today"
            subtitle="Add your first medication to get started"
            actionLabel="Add Medication"
            actionHref="/medication/add"
          />
        ) : (
          <>
            {/* Morning */}
            <View className="mb-6">
              <Typography variant="label" className="text-gray-500 dark:text-gray-400 mb-2">
                MORNING
              </Typography>
              {groupedDoses.morning.map(dose => (
                <DoseCard
                  key={`${dose.medication.id}-${dose.scheduledTime}`}
                  dose={dose}
                  onLogDose={handleLogDose}
                  onStatusChange={refresh}
                />
              ))}
            </View>

            {/* Afternoon */}
            <View className="mb-6">
              <Typography variant="label" className="text-gray-500 dark:text-gray-400 mb-2">
                AFTERNOON
              </Typography>
              {groupedDoses.afternoon.map(dose => (
                <DoseCard
                  key={`${dose.medication.id}-${dose.scheduledTime}`}
                  dose={dose}
                  onLogDose={handleLogDose}
                  onStatusChange={refresh}
                />
              ))}
            </View>

            {/* Evening */}
            <View className="mb-6">
              <Typography variant="label" className="text-gray-500 dark:text-gray-400 mb-2">
                EVENING
              </Typography>
              {groupedDoses.evening.map(dose => (
                <DoseCard
                  key={`${dose.medication.id}-${dose.scheduledTime}`}
                  dose={dose}
                  onLogDose={handleLogDose}
                  onStatusChange={refresh}
                />
              ))}
            </View>

            {/* Night */}
            <View className="mb-6">
              <Typography variant="label" className="text-gray-500 dark:text-gray-400 mb-2">
                NIGHT
              </Typography>
              {groupedDoses.night.map(dose => (
                <DoseCard
                  key={`${dose.medication.id}-${dose.scheduledTime}`}
                  dose={dose}
                  onLogDose={handleLogDose}
                  onStatusChange={refresh}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

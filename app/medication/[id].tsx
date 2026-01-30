import { View, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { format, parseISO, isToday as isTodayDate } from 'date-fns';
import * as Haptics from 'expo-haptics';

import { MedicationService } from '../../src/services/medication.service';
import { DoseLogService } from '../../src/services/doseLog.service';
import { Medication, DoseLog } from '../../src/types';
import { Screen } from '../../src/components/layout/Screen';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { Icon } from '../../src/components/ui/Icon';
import { MealTimingBadge } from '../../src/components/medication/MealTimingBadge';
import { MedicationStats } from '../../src/components/medication/MedicationStats';
import { colors } from '../../src/design/tokens';

export default function MedicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [medication, setMedication] = useState<Medication | null>(null);
  const [recentLogs, setRecentLogs] = useState<DoseLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const med = await MedicationService.getById(id);
      setMedication(med);
      if (med) {
        const logs = await DoseLogService.getLogsForMedication(med.id, 100);
        setRecentLogs(logs);
      }
    } catch (error) {
      console.error('Error loading medication:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/medication/edit/${id}`);
  };

  const handleTogglePause = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!medication) return;

    const isCurrentlyPaused = !medication.isActive || (medication.endDate && parseISO(medication.endDate) <= new Date());

    if (isCurrentlyPaused) {
      // Resume - clear end date if it was the pause mechanism
      await MedicationService.restore(medication.id);
      setMedication({
        ...medication,
        isActive: true,
        endDate: null,
      });
    } else {
      // Pause - set end date to today
      const today = new Date();
      await MedicationService.update(medication.id, {
        endDate: today,
      });
      setMedication({
        ...medication,
        endDate: today.toISOString().split('T')[0],
      });
    }
    await loadData();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Medication',
      'This will remove all history for this medication. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (medication) {
              setIsDeleting(true);
              try {
                await MedicationService.delete(medication.id);
                router.back();
              } catch (error) {
                console.error('Error deleting medication:', error);
                setIsDeleting(false);
                Alert.alert('Error', 'Failed to delete medication. Please try again.');
              }
            }
          },
        },
      ]
    );
  };

  if (isLoading || !medication) {
    return (
      <Screen scroll padX={16} padY={16}>
        <View className="flex-1 items-center justify-center py-20">
          <View className="w-16 h-16 rounded-full items-center justify-center mb-4" style={{ backgroundColor: colors.surface[100] }}>
            <Icon name="pill" fallback="medkit-outline" size={32} color={colors.surface[400]} />
          </View>
          <Typography variant="body" className="text-surface-500">
            Loading medication…
          </Typography>
        </View>
      </Screen>
    );
  }

  const scheduleTimes = JSON.parse(medication.scheduleTimes) as string[];
  const scheduleWeekdays = medication.scheduleWeekdays ? JSON.parse(medication.scheduleWeekdays) : [];
  const isPaused = !medication.isActive || (medication.endDate && parseISO(medication.endDate) <= new Date());

  return (
    <View className="flex-1 bg-surface-50">
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Medication Details',
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: colors.primary[500],
          headerTitleStyle: { fontWeight: '600', color: colors.surface[900] },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Icon
                name="chevron.left"
                fallback="arrow-back"
                size={24}
                color={colors.surface[900]}
              />
            </Pressable>
          ),
        }}
      />

      <Screen scroll padX={16} padY={16} padBottomExtra={120}>
        {/* Hero Section */}
        <View className="bg-white rounded-3xl border border-surface-100 p-6 mb-5">
          <View className="flex-row items-center mb-4">
            <View
              className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
              style={{ backgroundColor: medication.color || colors.primary[500] }}
            >
              <Icon name="pill" fallback="medkit" size={32} color="#fff" />
            </View>
            <View className="flex-1">
              <Typography variant="h2" className="text-surface-900 mb-1">
                {medication.name}
              </Typography>
              <Typography variant="body" className="text-surface-600">
                {medication.dosage} {medication.dosageUnit}
              </Typography>
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Icon
                name="calendar"
                fallback="calendar-outline"
                size={16}
                color={colors.surface[500]}
              />
              <Typography variant="small" className="text-surface-500 ml-2">
                Added {format(parseISO(medication.createdAt), 'MMM d, yyyy')}
              </Typography>
            </View>
            <MealTimingBadge timing={medication.mealTiming} size="lg" />
          </View>
        </View>

        {/* Schedule Section */}
        <View className="mb-5">
          <Typography variant="label" className="text-surface-500 mb-2 ml-1 uppercase tracking-wider text-xs">
            Schedule
          </Typography>
          <View className="bg-white rounded-3xl border border-surface-100 p-4">
            {medication.scheduleType === 'as-needed' ? (
              <View className="flex-row items-center">
                <View
                  className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                  style={{ backgroundColor: colors.warning[50] }}
                >
                  <Icon name="staroflife" fallback="star-outline" size={20} color={colors.warning[600]} />
                </View>
                <View className="flex-1">
                  <Typography variant="body" style={{ color: colors.surface[900] }}>
                    As needed (PRN)
                  </Typography>
                  <Typography variant="small" className="text-surface-500">
                    Take when needed, no fixed schedule
                  </Typography>
                </View>
              </View>
            ) : (
              <>
                <View className="mb-3">
                  <Typography variant="body" className="text-surface-900 mb-1">
                    {medication.scheduleType === 'daily' && 'Daily'}
                    {medication.scheduleType === 'weekly' &&
                      `Weekly on ${scheduleWeekdays
                        .map((d: number) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d])
                        .join(', ')}`}
                    {medication.scheduleType === 'interval' &&
                      `Every ${medication.scheduleIntervalHours} hours`}
                  </Typography>
                </View>

                <View className="gap-2">
                  {scheduleTimes.map((time, index) => (
                    <View key={index} className="flex-row items-center">
                      <View
                        className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                        style={{ backgroundColor: colors.primary[50] }}
                      >
                        <Icon name="clock" fallback="time-outline" size={20} color={colors.primary[600]} />
                      </View>
                      <View className="flex-1">
                        <Typography variant="body" style={{ color: colors.surface[900] }}>
                          {format(parseISO(`2024-01-01T${time}`), 'h:mm a')}
                        </Typography>
                        <Typography variant="small" className="text-surface-500">
                          {medication.mealTiming === 'before' && 'Before meal'}
                          {medication.mealTiming === 'after' && 'After meal'}
                          {medication.mealTiming === 'with' && 'With food'}
                          {medication.mealTiming === 'anytime' && 'Anytime'}
                        </Typography>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>

        {/* Duration Section */}
        <View className="mb-5">
          <Typography variant="label" className="text-surface-500 mb-2 ml-1 uppercase tracking-wider text-xs">
            Duration
          </Typography>
          <View className="bg-white rounded-3xl border border-surface-100 p-4">
            <View className="flex-row items-center mb-2">
              <View
                className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                style={{ backgroundColor: colors.success[50] }}
              >
                <Icon name="play.circle" fallback="play-circle-outline" size={20} color={colors.success[600]} />
              </View>
              <View className="flex-1">
                <Typography variant="label" className="text-surface-500 mb-0.5">
                  Started
                </Typography>
                <Typography variant="body" style={{ color: colors.surface[900] }}>
                  {format(parseISO(medication.startDate), 'MMM d, yyyy')}
                </Typography>
              </View>
            </View>
            {medication.endDate ? (
              <View className="flex-row items-center">
                <View
                  className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                  style={{ backgroundColor: isPaused ? colors.error[50] : colors.surface[100] }}
                >
                  <Icon
                    name={isPaused ? 'pause.circle' : 'stop.circle'}
                    fallback={isPaused ? 'pause-circle-outline' : 'stop-circle-outline'}
                    size={20}
                    color={isPaused ? colors.error[600] : colors.surface[700]}
                  />
                </View>
                <View className="flex-1">
                  <Typography variant="label" className="text-surface-500 mb-0.5">
                    {isPaused ? 'Paused' : 'Ends'}
                  </Typography>
                  <Typography variant="body" style={{ color: colors.surface[900] }}>
                    {format(parseISO(medication.endDate), 'MMM d, yyyy')}
                  </Typography>
                </View>
              </View>
            ) : (
              <View className="flex-row items-center">
                <View
                  className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                  style={{ backgroundColor: colors.surface[100] }}
                >
                  <Icon name="infinity" fallback="infinite-outline" size={20} color={colors.surface[700]} />
                </View>
                <View className="flex-1">
                  <Typography variant="label" className="text-surface-500 mb-0.5">
                    Duration
                  </Typography>
                  <Typography variant="body" style={{ color: colors.surface[900] }}>
                    Ongoing
                  </Typography>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Instructions Section */}
        {medication.instructions ? (
          <View className="mb-5">
            <Typography variant="label" className="text-surface-500 mb-2 ml-1 uppercase tracking-wider text-xs">
              Instructions
            </Typography>
            <View className="bg-white rounded-3xl border border-surface-100 p-4">
              <View className="flex-row items-start">
                <View
                  className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                  style={{ backgroundColor: colors.surface[100] }}
                >
                  <Icon name="info.circle" fallback="information-circle-outline" size={20} color={colors.surface[700]} />
                </View>
                <View className="flex-1">
                  <Typography variant="body" style={{ color: colors.surface[900] }}>
                    {medication.instructions}
                  </Typography>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        {/* Statistics Section */}
        <View className="mb-5">
          <Typography variant="label" className="text-surface-500 mb-2 ml-1 uppercase tracking-wider text-xs">
            Statistics
          </Typography>
          <MedicationStats medication={medication} recentLogs={recentLogs} />
        </View>

        {/* Recent History Section */}
        <View className="mb-6">
          <Typography variant="label" className="text-surface-500 mb-2 ml-1 uppercase tracking-wider text-xs">
            Recent History
          </Typography>
          <View className="bg-white rounded-3xl border border-surface-100 overflow-hidden">
            {recentLogs.length === 0 ? (
              <View className="p-8 items-center">
                <View
                  className="w-14 h-14 rounded-3xl items-center justify-center mb-3"
                  style={{ backgroundColor: colors.surface[100] }}
                >
                  <Icon name="tray" fallback="document-text-outline" size={24} color={colors.surface[500]} />
                </View>
                <Typography variant="body" className="text-surface-500">
                  No history yet
                </Typography>
              </View>
            ) : (
              recentLogs.slice(0, 10).map((log, index) => {
                const scheduledDate = parseISO(log.scheduledDate);
                const isRecent = isTodayDate(scheduledDate) || scheduledDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

                return (
                  <View
                    key={log.id}
                    className={`flex-row items-center justify-between p-4 ${
                      index < recentLogs.slice(0, 10).length - 1 ? 'border-b border-surface-100' : ''
                    }`}
                  >
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Typography variant="body" style={{ color: colors.surface[900] }}>
                          {isRecent
                            ? isTodayDate(scheduledDate)
                              ? 'Today'
                              : format(scheduledDate, 'EEE')
                            : format(scheduledDate, 'MMM d')}
                        </Typography>
                        <Typography variant="body" className="text-surface-600 mx-2">
                          ·
                        </Typography>
                        <Typography variant="body" style={{ color: colors.surface[900] }}>
                          {format(parseISO(`2024-01-01T${log.scheduledTime}`), 'h:mm a')}
                        </Typography>
                      </View>
                      {log.loggedAt && (
                        <Typography variant="small" className="text-surface-500">
                          Logged {format(parseISO(log.loggedAt), 'h:mm a')}
                        </Typography>
                      )}
                    </View>

                    <View
                      className="px-3 py-1.5 rounded-full flex-row items-center"
                      style={{
                        backgroundColor:
                          log.status === 'taken'
                            ? colors.success[50]
                            : log.status === 'missed'
                            ? colors.error[50]
                            : log.status === 'skipped'
                            ? colors.surface[100]
                            : colors.warning[50],
                      }}
                    >
                      <Icon
                        name={
                          log.status === 'taken'
                            ? 'checkmark.circle.fill'
                            : log.status === 'missed'
                            ? 'xmark.circle.fill'
                            : log.status === 'skipped'
                            ? 'minus.circle.fill'
                            : 'clock.fill'
                        }
                        fallback={
                          log.status === 'taken'
                            ? 'checkmark-circle'
                            : log.status === 'missed'
                            ? 'close-circle'
                            : log.status === 'skipped'
                            ? 'remove-circle'
                            : 'time'
                        }
                        size={16}
                        color={
                          log.status === 'taken'
                            ? colors.success[600]
                            : log.status === 'missed'
                            ? colors.error[600]
                            : log.status === 'skipped'
                            ? colors.surface[500]
                            : colors.warning[600]
                        }
                      />
                      <Typography
                        variant="small"
                        className="ml-1.5 font-semibold uppercase tracking-wider"
                        style={{
                          color:
                            log.status === 'taken'
                              ? colors.success[700]
                              : log.status === 'missed'
                              ? colors.error[600]
                              : log.status === 'skipped'
                              ? colors.surface[700]
                              : colors.warning[600],
                        }}
                      >
                        {log.status}
                      </Typography>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </Screen>

      {/* Quick Actions Footer */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-surface-100 p-4 pb-8">
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button
              title="Edit"
              variant="outline"
              size="lg"
              onPress={handleEdit}
              leftIcon={<Icon name="pencil" fallback="create-outline" size={18} color={colors.primary[600]} />}
            />
          </View>
          <View className="flex-1">
            <Button
              title={isPaused ? 'Resume' : 'Pause'}
              variant={isPaused ? 'success' : 'secondary'}
              size="lg"
              onPress={handleTogglePause}
              leftIcon={
                <Icon
                  name={isPaused ? 'play' : 'pause'}
                  fallback={isPaused ? 'play-outline' : 'pause-outline'}
                  size={18}
                  color={isPaused ? colors.success[700] : colors.surface[900]}
                />
              }
            />
          </View>
          <View className="flex-1">
            <Button
              title="Delete"
              variant="ghost"
              size="lg"
              onPress={handleDelete}
              disabled={isDeleting}
              leftIcon={<Icon name="trash" fallback="trash-outline" size={18} color={colors.error[600]} />}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

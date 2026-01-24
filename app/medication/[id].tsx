import { View, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';

import { MedicationService } from '../../src/services/medication.service';
import { DoseLogService } from '../../src/services/doseLog.service';
import { useMedicationForm } from '../../src/contexts';
import { Medication, DoseLog } from '../../src/types';
import { Screen } from '../../src/components/layout/Screen';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { IconButton } from '../../src/components/ui/IconButton';
import { MealTimingBadge } from '../../src/components/medication/MealTimingBadge';
import { StatusIndicator } from '../../src/components/medication/StatusIndicator';

export default function MedicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [medication, setMedication] = useState<Medication | null>(null);
  const [recentLogs, setRecentLogs] = useState<DoseLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { updateFormData, setIsEditing, setEditingId } = useMedicationForm();

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
        const logs = await DoseLogService.getLogsForMedication(med.id, 10);
        setRecentLogs(logs);
      }
    } catch (error) {
      console.error('Error loading medication:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (!medication) return;
    updateFormData({
      name: medication.name,
      dosage: medication.dosage,
      dosageUnit: medication.dosageUnit,
      instructions: medication.instructions || '',
      mealTiming: medication.mealTiming,
      scheduleType: medication.scheduleType,
      scheduleTimes: JSON.parse(medication.scheduleTimes),
      scheduleWeekdays: medication.scheduleWeekdays ? JSON.parse(medication.scheduleWeekdays) : [],
      scheduleIntervalHours: medication.scheduleIntervalHours || 6,
      startDate: parseISO(medication.startDate),
      endDate: medication.endDate ? parseISO(medication.endDate) : null,
      hasEndDate: !!medication.endDate,
      color: medication.color,
    });
    setIsEditing(true);
    setEditingId(medication.id);
    router.push('/medication/add');
  };

  const handleArchive = () => {
    Alert.alert('Archive Medication?', `Archive ${medication?.name}? You can restore it later.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        style: 'destructive',
        onPress: async () => {
          if (medication) {
            await MedicationService.archive(medication.id);
            router.back();
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Delete Medication?', `Permanently delete ${medication?.name} and all history? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (medication) {
            await MedicationService.delete(medication.id);
            router.back();
          }
        },
      },
    ]);
  };

  if (isLoading || !medication) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-50">
        <Typography variant="body">Loading…</Typography>
      </View>
    );
  }

  const scheduleTimes = JSON.parse(medication.scheduleTimes) as string[];

  return (
    <View className="flex-1 bg-surface-50">
      <Stack.Screen
        options={{
          headerShown: true,
          title: medication.name,
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#06B6D4',
          headerTitleStyle: { fontWeight: '600', color: '#171717' },
          headerShadowVisible: false,
          headerRight: () => <IconButton icon="pencil" variant="ghost" onPress={handleEdit} accessibilityLabel="Edit" />,
        }}
      />

      <Screen scroll includeTopInset={false} padX={16} padY={16} padBottomExtra={16}>
        {/* Header */}
        <View className="bg-white rounded-3xl border border-surface-100 p-6 mb-4 items-center">
          <View className="w-20 h-20 rounded-3xl items-center justify-center mb-4" style={{ backgroundColor: medication.color }}>
            <Ionicons name="medkit" size={36} color="#fff" />
          </View>
          <Typography variant="h2" className="text-surface-900 text-center mb-1">
            {medication.name}
          </Typography>
          <Typography variant="body" className="text-surface-600 mb-3">
            {medication.dosage} {medication.dosageUnit}
          </Typography>
          <MealTimingBadge timing={medication.mealTiming} size="lg" />
        </View>

        {/* Schedule */}
        <View className="mb-4">
          <Typography variant="label" className="text-surface-500 mb-2 ml-1 uppercase tracking-wider text-xs">
            Schedule
          </Typography>
          <View className="bg-white rounded-3xl border border-surface-100 p-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-2xl bg-primary-50 items-center justify-center mr-3">
                <Ionicons name="time-outline" size={20} color="#06B6D4" />
              </View>
              <Typography variant="body" className="text-surface-900 flex-1">
                {medication.scheduleType === 'daily' && `Daily at ${scheduleTimes.join(', ')}`}
                {medication.scheduleType === 'weekly' &&
                  `${JSON.parse(medication.scheduleWeekdays || '[]')
                    .map((d: number) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d])
                    .join(', ')} at ${scheduleTimes.join(', ')}`}
                {medication.scheduleType === 'interval' && `Every ${medication.scheduleIntervalHours} hours`}
                {medication.scheduleType === 'as-needed' && 'As needed (PRN)'}
              </Typography>
            </View>
          </View>
        </View>

        {/* Duration */}
        <View className="mb-4">
          <Typography variant="label" className="text-surface-500 mb-2 ml-1 uppercase tracking-wider text-xs">
            Duration
          </Typography>
          <View className="bg-white rounded-3xl border border-surface-100 p-4">
            <View className="flex-row items-center mb-2">
              <View className="w-10 h-10 rounded-2xl bg-surface-100 items-center justify-center mr-3">
                <Ionicons name="calendar-outline" size={20} color="#737373" />
              </View>
              <Typography variant="body" className="text-surface-900">
                Started {format(parseISO(medication.startDate), 'MMM d, yyyy')}
              </Typography>
            </View>
            {medication.endDate ? (
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-2xl bg-surface-100 items-center justify-center mr-3">
                  <Ionicons name="calendar" size={20} color="#737373" />
                </View>
                <Typography variant="body" className="text-surface-900">
                  Ends {format(parseISO(medication.endDate), 'MMM d, yyyy')}
                </Typography>
              </View>
            ) : (
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-2xl bg-surface-100 items-center justify-center mr-3">
                  <Ionicons name="infinite-outline" size={20} color="#737373" />
                </View>
                <Typography variant="body" className="text-surface-600">
                  Ongoing
                </Typography>
              </View>
            )}
          </View>
        </View>

        {/* Instructions */}
        {medication.instructions ? (
          <View className="mb-4">
            <Typography variant="label" className="text-surface-500 mb-2 ml-1 uppercase tracking-wider text-xs">
              Instructions
            </Typography>
            <View className="bg-white rounded-3xl border border-surface-100 p-4">
              <View className="flex-row items-start">
                <View className="w-10 h-10 rounded-2xl bg-accent-50 items-center justify-center mr-3">
                  <Ionicons name="information-circle-outline" size={20} color="#F97316" />
                </View>
                <Typography variant="body" className="text-surface-900 flex-1">
                  {medication.instructions}
                </Typography>
              </View>
            </View>
          </View>
        ) : null}

        {/* Recent history */}
        <View className="mb-6">
          <Typography variant="label" className="text-surface-500 mb-2 ml-1 uppercase tracking-wider text-xs">
            Recent history
          </Typography>
          <View className="bg-white rounded-3xl border border-surface-100 overflow-hidden">
            {recentLogs.length === 0 ? (
              <View className="p-8 items-center">
                <View className="w-14 h-14 rounded-3xl bg-surface-100 items-center justify-center mb-3">
                  <Ionicons name="document-text-outline" size={24} color="#737373" />
                </View>
                <Typography variant="body" className="text-surface-500">
                  No history yet
                </Typography>
              </View>
            ) : (
              recentLogs.map((log, index) => (
                <View
                  key={log.id}
                  className={`flex-row items-center justify-between p-4 ${index < recentLogs.length - 1 ? 'border-b border-surface-100' : ''}`}
                >
                  <Typography variant="body" className="text-surface-900">
                    {format(parseISO(log.scheduledDate), 'MMM d')} • {log.scheduledTime}
                  </Typography>
                  <StatusIndicator status={log.status} showLabel />
                </View>
              ))
            )}
          </View>
        </View>

        {/* Actions */}
        <View className="gap-3">
          <Button title="Archive Medication" variant="outline" size="lg" onPress={handleArchive} fullWidth />
          <Button title="Delete Permanently" variant="ghost" size="lg" onPress={handleDelete} fullWidth />
        </View>
      </Screen>
    </View>
  );
}

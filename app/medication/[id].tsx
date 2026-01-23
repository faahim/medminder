import { View, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { MedicationService } from '../../src/services/medication.service';
import { DoseLogService } from '../../src/services/doseLog.service';
import { useMedicationForm } from '../../src/contexts';
import { Medication, DoseLog } from '../../src/types';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { IconButton } from '../../src/components/ui/IconButton';
import { MealTimingBadge } from '../../src/components/medication/MealTimingBadge';
import { StatusIndicator } from '../../src/components/medication/StatusIndicator';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';

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
    
    // Populate form with medication data
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
    Alert.alert(
      'Archive Medication?',
      `Are you sure you want to archive ${medication?.name}? You can restore it later from the Archived tab.`,
      [
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
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Medication?',
      `This will permanently delete ${medication?.name} and all its history. This cannot be undone.`,
      [
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
      ]
    );
  };

  if (isLoading || !medication) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Typography variant="body">Loading...</Typography>
      </View>
    );
  }

  const scheduleTimes = JSON.parse(medication.scheduleTimes) as string[];

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Stack.Screen
        options={{
          headerShown: true,
          title: medication.name,
          headerRight: () => (
            <IconButton icon="pencil" variant="ghost" onPress={handleEdit} accessibilityLabel="Edit" />
          ),
        }}
      />
      
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24 }}>
        {/* Header Card */}
        <Card className="p-6 mb-6 items-center">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: medication.color + '30' }}
          >
            <Ionicons name="medical" size={40} color={medication.color} />
          </View>
          <Typography variant="h1" className="text-gray-900 dark:text-white text-center">
            {medication.name}
          </Typography>
          <Typography variant="body" className="text-gray-600 dark:text-gray-300 mb-3">
            {medication.dosage} {medication.dosageUnit}
          </Typography>
          <MealTimingBadge timing={medication.mealTiming} size="lg" />
        </Card>

        {/* Schedule Section */}
        <View className="mb-6">
          <Typography variant="label" className="text-gray-500 dark:text-gray-400 mb-2">
            Schedule
          </Typography>
          <Card className="p-4">
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={24} color="#6B7280" />
              <Typography variant="body" className="text-gray-900 dark:text-white ml-3">
                {medication.scheduleType === 'daily' && `Daily at ${scheduleTimes.join(', ')}`}
                {medication.scheduleType === 'weekly' && (
                  `${JSON.parse(medication.scheduleWeekdays || '[]')
                    .map((d: number) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d])
                    .join(', ')} at ${scheduleTimes.join(', ')}`
                )}
                {medication.scheduleType === 'interval' && (
                  `Every ${medication.scheduleIntervalHours} hours`
                )}
              </Typography>
            </View>
          </Card>
        </View>

        {/* Duration Section */}
        <View className="mb-6">
          <Typography variant="label" className="text-gray-500 dark:text-gray-400 mb-2">
            Duration
          </Typography>
          <Card className="p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="calendar-outline" size={24} color="#6B7280" />
              <Typography variant="body" className="text-gray-900 dark:text-white ml-3">
                Started: {format(parseISO(medication.startDate), 'MMM d, yyyy')}
              </Typography>
            </View>
            {medication.endDate && (
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={24} color="#6B7280" />
                <Typography variant="body" className="text-gray-900 dark:text-white ml-3">
                  Ends: {format(parseISO(medication.endDate), 'MMM d, yyyy')}
                </Typography>
              </View>
            )}
            {!medication.endDate && (
              <View className="flex-row items-center">
                <Ionicons name="infinite-outline" size={24} color="#6B7280" />
                <Typography variant="body" className="text-gray-600 dark:text-gray-300 ml-3">
                  Ongoing (no end date)
                </Typography>
              </View>
            )}
          </Card>
        </View>

        {/* Instructions Section */}
        {medication.instructions && (
          <View className="mb-6">
            <Typography variant="label" className="text-gray-500 dark:text-gray-400 mb-2">
              Instructions
            </Typography>
            <Card className="p-4">
              <View className="flex-row items-start">
                <Ionicons name="information-circle-outline" size={24} color="#6B7280" />
                <Typography variant="body" className="text-gray-900 dark:text-white ml-3 flex-1">
                  {medication.instructions}
                </Typography>
              </View>
            </Card>
          </View>
        )}

        {/* Recent History Section */}
        <View className="mb-6">
          <Typography variant="label" className="text-gray-500 dark:text-gray-400 mb-2">
            Recent History
          </Typography>
          <Card className="p-4">
            {recentLogs.length === 0 ? (
              <Typography variant="body" className="text-gray-500 dark:text-gray-400 text-center py-4">
                No history yet
              </Typography>
            ) : (
              recentLogs.map((log) => (
                <View key={log.id} className="flex-row items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <View>
                    <Typography variant="body" className="text-gray-900 dark:text-white">
                      {format(parseISO(log.scheduledDate), 'MMM d')} at {log.scheduledTime}
                    </Typography>
                  </View>
                  <StatusIndicator status={log.status} showLabel />
                </View>
              ))
            )}
          </Card>
        </View>

        {/* Actions */}
        <View className="gap-3 mb-8">
          <Button
            title="Archive Medication"
            variant="outline"
            size="lg"
            onPress={handleArchive}
            fullWidth
          />
          <Button
            title="Delete Permanently"
            variant="ghost"
            size="lg"
            onPress={handleDelete}
            className="text-red-500"
            fullWidth
          />
        </View>
      </ScrollView>
    </View>
  );
}

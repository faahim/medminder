import { View, Alert } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { parseISO } from 'date-fns';
import * as Haptics from 'expo-haptics';

import { MedicationService } from '../../../src/services/medication.service';
import { Medication, MedicationFormData } from '../../../src/types';
import { Screen } from '../../../src/components/layout/Screen';
import { Typography } from '../../../src/components/ui/Typography';
import { Button } from '../../../src/components/ui/Button';
import { Input } from '../../../src/components/ui/Input';
import { Select } from '../../../src/components/ui/Select';
import { Icon } from '../../../src/components/ui/Icon';
import { colors, spacing } from '../../../src/design/tokens';
import { DatePickerModal } from '../../../src/components/ui/DatePickerModal';

type MealTiming = 'before' | 'after' | 'with' | 'anytime';
type ScheduleType = 'daily' | 'weekly' | 'interval' | 'as-needed';

const MEAL_TIMING_OPTIONS = [
  { label: 'Before meal', value: 'before' },
  { label: 'After meal', value: 'after' },
  { label: 'With food', value: 'with' },
  { label: 'Anytime', value: 'anytime' },
] as const;

const SCHEDULE_TYPE_OPTIONS = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Interval (hours)', value: 'interval' },
  { label: 'As needed', value: 'as-needed' },
] as const;

const WEEKDAY_OPTIONS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
] as const;

const DOSAGE_UNIT_OPTIONS = [
  { label: 'mg', value: 'mg' },
  { label: 'ml', value: 'ml' },
  { label: 'tablet', value: 'tablet' },
  { label: 'capsule', value: 'capsule' },
  { label: 'teaspoon', value: 'teaspoon' },
  { label: 'tablespoon', value: 'tablespoon' },
  { label: 'drop', value: 'drop' },
  { label: 'puff', value: 'puff' },
  { label: 'patch', value: 'patch' },
  { label: 'unit', value: 'unit' },
] as const;

const COLOR_OPTIONS = [
  { label: 'Cyan', value: '#06B6D4' },
  { label: 'Blue', value: '#3B82F6' },
  { label: 'Purple', value: '#8B5CF6' },
  { label: 'Pink', value: '#EC4899' },
  { label: 'Red', value: '#EF4444' },
  { label: 'Orange', value: '#F97316' },
  { label: 'Yellow', value: '#F59E0B' },
  { label: 'Green', value: '#22C55E' },
  { label: 'Teal', value: '#14B8A6' },
  { label: 'Gray', value: '#6B7280' },
] as const;

export default function EditMedicationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [medication, setMedication] = useState<Medication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [dosageUnit, setDosageUnit] = useState('tablet');
  const [instructions, setInstructions] = useState('');
  const [mealTiming, setMealTiming] = useState<MealTiming>('anytime');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('daily');
  const [scheduleTimes, setScheduleTimes] = useState<string[]>(['08:00']);
  const [scheduleWeekdays, setScheduleWeekdays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [scheduleIntervalHours, setScheduleIntervalHours] = useState(6);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [color, setColor] = useState('#06B6D4');

  // Date picker state
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    loadMedication();
  }, [id]);

  const loadMedication = async () => {
    if (!id) {
      router.back();
      return;
    }

    try {
      const med = await MedicationService.getById(id);
      if (!med) {
        Alert.alert('Error', 'Medication not found');
        router.back();
        return;
      }

      setMedication(med);
      setName(med.name);
      setDosage(med.dosage);
      setDosageUnit(med.dosageUnit);
      setInstructions(med.instructions || '');
      setMealTiming(med.mealTiming);
      setScheduleType(med.scheduleType);
      setScheduleTimes(JSON.parse(med.scheduleTimes));
      setScheduleWeekdays(med.scheduleWeekdays ? JSON.parse(med.scheduleWeekdays) : [0, 1, 2, 3, 4, 5, 6]);
      setScheduleIntervalHours(med.scheduleIntervalHours || 6);
      setStartDate(parseISO(med.startDate));
      if (med.endDate) {
        setEndDate(parseISO(med.endDate));
        setHasEndDate(true);
      }
      setColor(med.color || '#06B6D4');
    } catch (error) {
      console.error('Error loading medication:', error);
      Alert.alert('Error', 'Failed to load medication');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Validation
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a medication name');
      return;
    }
    if (!dosage.trim()) {
      Alert.alert('Required', 'Please enter a dosage');
      return;
    }
    if (scheduleType !== 'as-needed' && scheduleTimes.length === 0) {
      Alert.alert('Required', 'Please add at least one schedule time');
      return;
    }
    if (scheduleType === 'weekly' && scheduleWeekdays.length === 0) {
      Alert.alert('Required', 'Please select at least one day of the week');
      return;
    }
    if (scheduleType === 'interval' && scheduleIntervalHours < 1) {
      Alert.alert('Invalid', 'Interval must be at least 1 hour');
      return;
    }

    setIsSaving(true);
    try {
      const formData: Partial<MedicationFormData> = {
        name: name.trim(),
        dosage: dosage.trim(),
        dosageUnit,
        instructions: instructions.trim(),
        mealTiming,
        scheduleType,
        scheduleTimes,
        scheduleWeekdays,
        scheduleIntervalHours,
        startDate,
        endDate: hasEndDate ? endDate : null,
        color,
      };

      await MedicationService.update(medication!.id, formData);
      Alert.alert('Success', 'Medation updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error updating medication:', error);
      Alert.alert('Error', 'Failed to update medication');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddScheduleTime = () => {
    setScheduleTimes([...scheduleTimes, '12:00']);
  };

  const handleRemoveScheduleTime = (index: number) => {
    setScheduleTimes(scheduleTimes.filter((_, i) => i !== index));
  };

  const handleUpdateTime = (index: number, time: string) => {
    const newTimes = [...scheduleTimes];
    newTimes[index] = time;
    setScheduleTimes(newTimes);
  };

  const toggleWeekday = (day: number) => {
    setScheduleWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <Screen scroll padX={16} padY={16}>
        <View className="flex-1 items-center justify-center py-20">
          <Typography variant="body">Loading medication…</Typography>
        </View>
      </Screen>
    );
  }

  return (
    <View className="flex-1 bg-surface-50">
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Edit Medication',
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: colors.primary[500],
          headerTitleStyle: { fontWeight: '600', color: colors.surface[900] },
          headerShadowVisible: false,
          headerLeft: () => (
            <Icon
              name="chevron.left"
              fallback="arrow-back"
              size={24}
              color={colors.surface[900]}
              onPress={() => router.back()}
            />
          ),
        }}
      />

      <Screen scroll padX={16} padY={16} padBottomExtra={100}>
        {/* Basic Info */}
        <View className="mb-5">
          <Typography variant="label" className="text-surface-500 mb-2 ml-1 uppercase tracking-wider text-xs">
            Basic Information
          </Typography>
          <View className="bg-white rounded-3xl border border-surface-100 p-4">
            <Input
              label="Medication Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g., Aspirin"
              leftIcon={<Icon name="pill" fallback="medkit-outline" size={20} color={colors.surface[500]} />}
            />
            <View className="flex-row gap-3 mt-3">
              <View className="flex-1">
                <Input
                  label="Dosage"
                  value={dosage}
                  onChangeText={setDosage}
                  placeholder="e.g., 100"
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <Select
                  label="Unit"
                  value={dosageUnit}
                  onValueChange={setDosageUnit}
                  options={DOSAGE_UNIT_OPTIONS.map((opt) => ({ ...opt, label: opt.value }))}
                />
              </View>
            </View>
            <Input
              className="mt-3"
              label="Instructions (optional)"
              value={instructions}
              onChangeText={setInstructions}
              placeholder="e.g., Take with full glass of water"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Meal Timing */}
        <View className="mb-5">
          <Typography variant="label" className="text-surface-500 mb-2 ml-1 uppercase tracking-wider text-xs">
            Meal Timing
          </Typography>
          <View className="bg-white rounded-3xl border border-surface-100 p-4">
            <Select
              label="When to take"
              value={mealTiming}
              onValueChange={(value) => setMealTiming(value as MealTiming)}
              options={MEAL_TIMING_OPTIONS}
            />
          </View>
        </View>

        {/* Schedule */}
        <View className="mb-5">
          <Typography variant="label" className="text-surface-500 mb-2 ml-1 uppercase tracking-wider text-xs">
            Schedule
          </Typography>
          <View className="bg-white rounded-3xl border border-surface-100 p-4">
            <Select
              label="Schedule Type"
              value={scheduleType}
              onValueChange={(value) => setScheduleType(value as ScheduleType)}
              options={SCHEDULE_TYPE_OPTIONS}
            />

            {scheduleType !== 'as-needed' && (
              <>
                {scheduleType === 'interval' ? (
                  <View className="mt-3">
                    <Input
                      label="Interval (hours)"
                      value={scheduleIntervalHours.toString()}
                      onChangeText={(value) => setScheduleIntervalHours(parseInt(value) || 6)}
                      keyboardType="numeric"
                      placeholder="e.g., 6"
                    />
                  </View>
                ) : (
                  <View className="mt-3">
                    <Typography variant="label" className="text-surface-700 mb-2">
                      Schedule Times
                    </Typography>
                    {scheduleTimes.map((time, index) => (
                      <View key={index} className="flex-row items-center gap-2 mb-2">
                        <Input
                          className="flex-1"
                          value={time}
                          onChangeText={(value) => handleUpdateTime(index, value)}
                          placeholder="HH:MM"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onPress={() => handleRemoveScheduleTime(index)}
                          leftIcon={<Icon name="trash" fallback="trash-outline" size={16} color={colors.error[500]} />}
                        />
                      </View>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      title="Add Time"
                      onPress={handleAddScheduleTime}
                      leftIcon={<Icon name="plus" fallback="add-outline" size={16} color={colors.primary[600]} />}
                    />
                  </View>
                )}

                {scheduleType === 'weekly' && (
                  <View className="mt-4">
                    <Typography variant="label" className="text-surface-700 mb-2">
                      Days of the Week
                    </Typography>
                    <View className="flex-row flex-wrap gap-2">
                      {WEEKDAY_OPTIONS.map((day) => (
                        <Button
                          key={day.value}
                          variant={scheduleWeekdays.includes(day.value) ? 'primary' : 'outline'}
                          size="sm"
                          title={day.label}
                          onPress={() => toggleWeekday(day.value)}
                        />
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* Duration */}
        <View className="mb-5">
          <Typography variant="label" className="text-surface-500 mb-2 ml-1 uppercase tracking-wider text-xs">
            Duration
          </Typography>
          <View className="bg-white rounded-3xl border border-surface-100 p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Typography variant="body" className="text-surface-900">
                Start Date
              </Typography>
              <Button
                variant="outline"
                size="sm"
                title={startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                onPress={() => setShowStartDatePicker(true)}
              />
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Typography variant="body" className="text-surface-900 mr-2">
                  End Date
                </Typography>
                <Button
                  variant="ghost"
                  size="sm"
                  title={hasEndDate ? 'Yes' : 'No'}
                  onPress={() => setHasEndDate(!hasEndDate)}
                />
              </View>
              {hasEndDate && (
                <Button
                  variant="outline"
                  size="sm"
                  title={
                    endDate
                      ? endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Select Date'
                  }
                  onPress={() => setShowEndDatePicker(true)}
                />
              )}
            </View>
          </View>
        </View>

        {/* Color */}
        <View className="mb-6">
          <Typography variant="label" className="text-surface-500 mb-2 ml-1 uppercase tracking-wider text-xs">
            Color
          </Typography>
          <View className="bg-white rounded-3xl border border-surface-100 p-4">
            <View className="flex-row flex-wrap gap-3">
              {COLOR_OPTIONS.map((colorOption) => (
                <View
                  key={colorOption.value}
                  className={`w-12 h-12 rounded-2xl items-center justify-center ${
                    color === colorOption.value ? 'ring-2 ring-primary-500 ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: colorOption.value }}
                >
                  {color === colorOption.value && (
                    <Icon name="checkmark" fallback="checkmark" size={20} color="#fff" />
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      </Screen>

      {/* Save Button Footer */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-surface-100 p-4 pb-8">
        <Button
          title="Save Changes"
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleSave}
          loading={isSaving}
          leftIcon={<Icon name="checkmark" fallback="checkmark-circle" size={18} color="#fff" />}
        />
      </View>

      {/* Date Pickers */}
      <DatePickerModal
        visible={showStartDatePicker}
        date={startDate}
        onConfirm={(date) => {
          setStartDate(date);
          setShowStartDatePicker(false);
        }}
        onCancel={() => setShowStartDatePicker(false)}
      />
      <DatePickerModal
        visible={showEndDatePicker}
        date={endDate || new Date()}
        onConfirm={(date) => {
          setEndDate(date);
          setShowEndDatePicker(false);
        }}
        onCancel={() => setShowEndDatePicker(false)}
      />
    </View>
  );
}

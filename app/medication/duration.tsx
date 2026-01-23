import { View, Switch, ScrollView, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { useMedicationForm } from '../../src/contexts/MedicationFormContext';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Input } from '../../src/components/ui/Input';
import { Ionicons } from '@expo/vector-icons';
import { MedicationService } from '../../src/services/medication.service';
import { Medication } from '../../src/types';
import { format, addDays } from 'date-fns';

const QUICK_DURATIONS = [
  { label: '1 week', days: 7 },
  { label: '2 weeks', days: 14 },
  { label: '3 weeks', days: 21 },
  { label: '1 month', days: 30 },
  { label: '2 months', days: 60 },
  { label: '3 months', days: 90 },
];

export default function AddMedicationStep4() {
  const { formData, updateFormData, editingId } = useMedicationForm();
  const [existingMeds, setExistingMeds] = useState<Medication[]>([]);
  const [showDependencyPicker, setShowDependencyPicker] = useState(false);

  // Load existing medications for dependency selection
  useEffect(() => {
    const loadMeds = async () => {
      const meds = await MedicationService.getAll();
      // Filter: only show medications with end dates (excluding current if editing)
      const medsWithEndDate = meds.filter(
        m => m.endDate && m.id !== editingId
      );
      setExistingMeds(medsWithEndDate);
    };
    loadMeds();
  }, [editingId]);

  const selectedDependency = existingMeds.find(m => m.id === formData.dependsOnMedicationId);

  const handleSelectDependency = (med: Medication | null) => {
    if (med) {
      updateFormData({
        dependsOnMedicationId: med.id,
        dependsOnOffsetDays: 0,
        // Calculate start date based on dependency end date
        startDate: med.endDate ? new Date(med.endDate) : new Date(),
      });
    } else {
      updateFormData({
        dependsOnMedicationId: null,
        dependsOnOffsetDays: 0,
        startDate: new Date(),
      });
    }
    setShowDependencyPicker(false);
  };

  const formatDateForInput = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  return (
    <ScreenWrapper>
      <ProgressBar current={4} total={5} />

      <ScrollView className="flex-1 px-6 py-6">
        <Typography variant="h2" className="text-surface-900 dark:text-white mb-1">
          Duration
        </Typography>
        <Typography variant="body" className="text-surface-500 dark:text-surface-400 mb-6">
          Step 4 of 5: When do you start and stop?
        </Typography>

        {/* Dependency Section */}
        {existingMeds.length > 0 && (
          <View className="mb-8">
            <Typography variant="label" className="text-surface-600 dark:text-surface-400 mb-3 uppercase tracking-wider text-xs">
              Starts After Another Medication?
            </Typography>

            {!selectedDependency ? (
              <Pressable
                onPress={() => setShowDependencyPicker(true)}
                className="flex-row items-center p-4 rounded-2xl border-2 border-dashed border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-800/50"
              >
                <View className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 items-center justify-center mr-4">
                  <Ionicons name="git-branch-outline" size={24} color="#8B5CF6" />
                </View>
                <View className="flex-1">
                  <Typography variant="body" className="text-surface-700 dark:text-surface-300 font-medium">
                    Link to another medication
                  </Typography>
                  <Typography variant="small" className="text-surface-500 dark:text-surface-400">
                    Start this medication after another one finishes
                  </Typography>
                </View>
                <Ionicons name="add-circle" size={24} color="#8B5CF6" />
              </Pressable>
            ) : (
              <View className="bg-violet-50 dark:bg-violet-950 rounded-2xl p-4 border-2 border-violet-200 dark:border-violet-800">
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900 items-center justify-center mr-3">
                    <Ionicons name="git-branch" size={20} color="#8B5CF6" />
                  </View>
                  <View className="flex-1">
                    <Typography variant="small" className="text-violet-600 dark:text-violet-400">
                      Starts after
                    </Typography>
                    <Typography variant="body" className="text-violet-800 dark:text-violet-200 font-semibold">
                      {selectedDependency.name}
                    </Typography>
                  </View>
                  <Pressable
                    onPress={() => handleSelectDependency(null)}
                    className="w-8 h-8 rounded-full bg-violet-200 dark:bg-violet-800 items-center justify-center"
                  >
                    <Ionicons name="close" size={18} color="#8B5CF6" />
                  </Pressable>
                </View>

                {/* Offset Days */}
                <View className="bg-white dark:bg-surface-800 rounded-xl p-3 flex-row items-center">
                  <Typography variant="body" className="text-surface-700 dark:text-surface-300 flex-1">
                    Wait days after completion:
                  </Typography>
                  <View className="flex-row items-center">
                    <Pressable
                      onPress={() => updateFormData({
                        dependsOnOffsetDays: Math.max(0, formData.dependsOnOffsetDays - 1)
                      })}
                      className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-700 items-center justify-center"
                    >
                      <Ionicons name="remove" size={20} color="#737373" />
                    </Pressable>
                    <Typography variant="h3" className="text-surface-900 dark:text-white font-bold mx-4 w-8 text-center">
                      {formData.dependsOnOffsetDays}
                    </Typography>
                    <Pressable
                      onPress={() => updateFormData({
                        dependsOnOffsetDays: formData.dependsOnOffsetDays + 1
                      })}
                      className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-700 items-center justify-center"
                    >
                      <Ionicons name="add" size={20} color="#737373" />
                    </Pressable>
                  </View>
                </View>

                {selectedDependency.endDate && (
                  <View className="mt-3 flex-row items-center">
                    <Ionicons name="calendar-outline" size={16} color="#8B5CF6" />
                    <Typography variant="small" className="text-violet-600 dark:text-violet-400 ml-2">
                      Will start on {format(
                        addDays(new Date(selectedDependency.endDate), formData.dependsOnOffsetDays),
                        'MMM d, yyyy'
                      )}
                    </Typography>
                  </View>
                )}
              </View>
            )}

            {/* Dependency Picker Modal (inline for now) */}
            {showDependencyPicker && (
              <View className="mt-4 bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden">
                <View className="px-4 py-3 bg-surface-100 dark:bg-surface-700/50 border-b border-surface-200 dark:border-surface-700">
                  <Typography variant="label" className="text-surface-600 dark:text-surface-400 uppercase tracking-wider text-xs">
                    Select Medication
                  </Typography>
                </View>
                {existingMeds.map(med => (
                  <Pressable
                    key={med.id}
                    onPress={() => handleSelectDependency(med)}
                    className="flex-row items-center px-4 py-3 border-b border-surface-100 dark:border-surface-800 active:bg-surface-50 dark:active:bg-surface-700"
                  >
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                      style={{ backgroundColor: med.color + '20' }}
                    >
                      <Ionicons name="medical" size={20} color={med.color} />
                    </View>
                    <View className="flex-1">
                      <Typography variant="body" className="text-surface-900 dark:text-white font-medium">
                        {med.name}
                      </Typography>
                      <Typography variant="small" className="text-surface-500 dark:text-surface-400">
                        Ends {med.endDate ? format(new Date(med.endDate), 'MMM d, yyyy') : 'N/A'}
                      </Typography>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#A3A3A3" />
                  </Pressable>
                ))}
                <Pressable
                  onPress={() => setShowDependencyPicker(false)}
                  className="px-4 py-3"
                >
                  <Typography variant="body" className="text-surface-500 text-center">
                    Cancel
                  </Typography>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* Start Date (only if no dependency) */}
        {!formData.dependsOnMedicationId && (
          <View className="mb-6">
            <Typography variant="label" className="text-surface-600 dark:text-surface-400 mb-3 uppercase tracking-wider text-xs">
              Start Date
            </Typography>
            <Input
              value={formatDateForInput(formData.startDate)}
              onChangeText={(text) => {
                const date = new Date(text);
                if (!isNaN(date.getTime())) {
                  updateFormData({ startDate: date });
                }
              }}
              placeholder="YYYY-MM-DD"
              size="lg"
            />
            <Typography variant="small" className="text-surface-500 dark:text-surface-400 mt-2">
              Format: YYYY-MM-DD (e.g., 2025-01-23)
            </Typography>
          </View>
        )}

        {/* Has End Date Toggle */}
        <View className="mb-6">
          <Pressable
            onPress={() => updateFormData({
              hasEndDate: !formData.hasEndDate,
              endDate: !formData.hasEndDate ? addDays(formData.startDate, 7) : null
            })}
            className={`flex-row items-center p-4 rounded-2xl border-2 ${
              formData.hasEndDate
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                : 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800'
            }`}
          >
            <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${
              formData.hasEndDate
                ? 'bg-primary-100 dark:bg-primary-900'
                : 'bg-surface-100 dark:bg-surface-700'
            }`}>
              <Ionicons
                name={formData.hasEndDate ? 'calendar' : 'calendar-outline'}
                size={24}
                color={formData.hasEndDate ? '#06B6D4' : '#737373'}
              />
            </View>
            <View className="flex-1">
              <Typography variant="body" className={`font-semibold ${
                formData.hasEndDate ? 'text-primary-700 dark:text-primary-300' : 'text-surface-900 dark:text-white'
              }`}>
                This medication has an end date
              </Typography>
              <Typography variant="small" className="text-surface-500 dark:text-surface-400">
                For temporary prescriptions or courses
              </Typography>
            </View>
            <View className={`w-6 h-6 rounded-full items-center justify-center ${
              formData.hasEndDate ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-600'
            }`}>
              {formData.hasEndDate && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
          </Pressable>
        </View>

        {/* End Date & Quick Duration */}
        {formData.hasEndDate && (
          <>
            <View className="mb-6">
              <Typography variant="label" className="text-surface-600 dark:text-surface-400 mb-3 uppercase tracking-wider text-xs">
                End Date
              </Typography>
              <Input
                value={formData.endDate ? formatDateForInput(formData.endDate) : ''}
                onChangeText={(text) => {
                  const date = new Date(text);
                  if (!isNaN(date.getTime())) {
                    updateFormData({ endDate: date });
                  }
                }}
                placeholder="YYYY-MM-DD"
                size="lg"
              />
            </View>

            {/* Quick Duration Buttons */}
            <View className="mb-6">
              <Typography variant="label" className="text-surface-600 dark:text-surface-400 mb-3 uppercase tracking-wider text-xs">
                Quick Duration
              </Typography>
              <View className="flex-row flex-wrap gap-2">
                {QUICK_DURATIONS.map((duration) => {
                  const endDate = addDays(formData.startDate, duration.days);
                  const isSelected = formData.endDate &&
                    formatDateForInput(formData.endDate) === formatDateForInput(endDate);

                  return (
                    <Pressable
                      key={duration.days}
                      onPress={() => updateFormData({ endDate })}
                      className={`px-4 py-2.5 rounded-xl ${
                        isSelected
                          ? 'bg-primary-500'
                          : 'bg-surface-100 dark:bg-surface-800'
                      }`}
                    >
                      <Typography
                        variant="body"
                        className={`font-medium ${
                          isSelected ? 'text-white' : 'text-surface-700 dark:text-surface-300'
                        }`}
                      >
                        {duration.label}
                      </Typography>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {/* Ongoing Medication Info */}
        {!formData.hasEndDate && (
          <View className="mb-6 bg-surface-100 dark:bg-surface-800 rounded-2xl p-4">
            <View className="flex-row items-start">
              <View className="w-10 h-10 rounded-xl bg-surface-200 dark:bg-surface-700 items-center justify-center mr-3">
                <Ionicons name="infinite-outline" size={24} color="#737373" />
              </View>
              <View className="flex-1">
                <Typography variant="body" className="text-surface-700 dark:text-surface-300 font-medium mb-1">
                  Ongoing Medication
                </Typography>
                <Typography variant="small" className="text-surface-500 dark:text-surface-400">
                  This medication will continue indefinitely until you archive it manually.
                </Typography>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View className="px-6 pb-8 pt-4 bg-white dark:bg-surface-900 border-t border-surface-100 dark:border-surface-800">
        <View className="flex-row gap-3">
          <Button
            title="Back"
            variant="secondary"
            size="lg"
            onPress={() => router.back()}
            className="flex-1"
          />
          <Button
            title="Review"
            size="lg"
            onPress={() => router.push('/medication/confirm')}
            className="flex-1"
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

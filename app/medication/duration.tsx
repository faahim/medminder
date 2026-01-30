import { View, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, addDays } from 'date-fns';

import { useMedicationForm } from '../../src/contexts/MedicationFormContext';
import { Screen } from '../../src/components/layout/Screen';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Input } from '../../src/components/ui/Input';
import { Icon } from '../../src/components/ui/Icon';
import { MedicationService } from '../../src/services/medication.service';
import { Medication } from '../../src/types';

const QUICK_DURATIONS = [
  { label: '1 week', days: 7 },
  { label: '2 weeks', days: 14 },
  { label: '1 month', days: 30 },
  { label: '2 months', days: 60 },
  { label: '3 months', days: 90 },
];

export default function AddMedicationStep4() {
  const insets = useSafeAreaInsets();
  const { formData, updateFormData, editingId } = useMedicationForm();
  const [existingMeds, setExistingMeds] = useState<Medication[]>([]);
  const [showDependencyPicker, setShowDependencyPicker] = useState(false);

  useEffect(() => {
    const load = async () => {
      const meds = await MedicationService.getAll();
      setExistingMeds(meds.filter((m) => m.endDate && m.id !== editingId));
    };
    load();
  }, [editingId]);

  const selectedDependency = existingMeds.find((m) => m.id === formData.dependsOnMedicationId);

  const handleSelectDependency = (med: Medication | null) => {
    if (med) {
      updateFormData({
        dependsOnMedicationId: med.id,
        dependsOnOffsetDays: 0,
        startDate: med.endDate ? new Date(med.endDate) : new Date(),
      });
    } else {
      updateFormData({ dependsOnMedicationId: null, dependsOnOffsetDays: 0, startDate: new Date() });
    }
    setShowDependencyPicker(false);
  };

  const fmt = (date: Date) => format(date, 'yyyy-MM-dd');

  return (
    <View className="flex-1 bg-surface-50">
      <ProgressBar current={4} total={6} />

      <Screen scroll keyboardAvoiding includeTopInset={false} padX={16} padY={16} padBottomExtra={170}>
        <Typography variant="h2" className="text-surface-900 mb-1">
          Duration
        </Typography>
        <Typography variant="body" className="text-surface-500 mb-6">
          Step 4 of 6 · Start & end
        </Typography>

        <View className="bg-white rounded-3xl border border-surface-100 p-5">
          {/* Dependency */}
          {existingMeds.length > 0 ? (
            <View className="mb-6">
              <Typography variant="label" className="text-surface-600 mb-2 uppercase tracking-wider text-xs">
                Starts after another medication?
              </Typography>

              {!selectedDependency ? (
                <Pressable
                  onPress={() => setShowDependencyPicker(true)}
                  className="flex-row items-center p-4 rounded-2xl border border-dashed border-surface-300 bg-surface-50"
                >
                  <View className="w-12 h-12 rounded-2xl bg-surface-100 items-center justify-center mr-4">
                    <Icon name="arrow.triangle.merge" fallback="git-branch" size={22} color="#8B5CF6" />
                  </View>
                  <View className="flex-1">
                    <Typography variant="body" className="text-surface-900 font-medium">
                      Link to another medication
                    </Typography>
                    <Typography variant="small" className="text-surface-500">
                      Start after it finishes
                    </Typography>
                  </View>
                  <Icon name="plus.circle" fallback="add-circle" size={22} color="#8B5CF6" />
                </Pressable>
              ) : (
                <View className="bg-surface-50 rounded-2xl p-4 border border-surface-100">
                  <View className="flex-row items-center mb-3">
                    <View className="w-10 h-10 rounded-2xl bg-white items-center justify-center mr-3">
                      <Icon name="arrow.triangle.merge" fallback="git-branch" size={18} color="#8B5CF6" />
                    </View>
                    <View className="flex-1">
                      <Typography variant="small" className="text-surface-500">
                        Starts after
                      </Typography>
                      <Typography variant="body" className="text-surface-900 font-semibold">
                        {selectedDependency.name}
                      </Typography>
                    </View>
                    <Pressable
                      onPress={() => handleSelectDependency(null)}
                      className="w-9 h-9 rounded-full bg-white items-center justify-center"
                    >
                      <Icon name="xmark" fallback="close" size={18} color="#737373" />
                    </Pressable>
                  </View>

                  <View className="bg-white rounded-2xl p-3 flex-row items-center">
                    <Typography variant="body" className="text-surface-700 flex-1">
                      Wait days:
                    </Typography>
                    <View className="flex-row items-center">
                      <Pressable
                        onPress={() => updateFormData({ dependsOnOffsetDays: Math.max(0, formData.dependsOnOffsetDays - 1) })}
                        className="w-10 h-10 rounded-2xl bg-surface-100 items-center justify-center"
                      >
                        <Icon name="minus" fallback="remove" size={18} color="#737373" />
                      </Pressable>
                      <Typography variant="h3" className="text-surface-900 font-bold mx-4 w-8 text-center">
                        {formData.dependsOnOffsetDays}
                      </Typography>
                      <Pressable
                        onPress={() => updateFormData({ dependsOnOffsetDays: formData.dependsOnOffsetDays + 1 })}
                        className="w-10 h-10 rounded-2xl bg-surface-100 items-center justify-center"
                      >
                        <Icon name="plus" fallback="add" size={18} color="#737373" />
                      </Pressable>
                    </View>
                  </View>

                  {selectedDependency.endDate ? (
                    <View className="mt-3 flex-row items-center">
                      <Icon name="calendar" fallback="calendar" size={16} color="#8B5CF6" />
                      <Typography variant="small" className="text-surface-600 ml-2">
                        Will start on {format(addDays(new Date(selectedDependency.endDate), formData.dependsOnOffsetDays), 'MMM d, yyyy')}
                      </Typography>
                    </View>
                  ) : null}
                </View>
              )}

              {showDependencyPicker ? (
                <View className="mt-4 bg-white rounded-2xl border border-surface-100 overflow-hidden">
                  <View className="px-4 py-3 bg-surface-100 border-b border-surface-100">
                    <Typography variant="label" className="text-surface-600 uppercase tracking-wider text-xs">
                      Select medication
                    </Typography>
                  </View>
                  {existingMeds.map((med) => (
                    <Pressable
                      key={med.id}
                      onPress={() => handleSelectDependency(med)}
                      className="flex-row items-center px-4 py-3 border-b border-surface-100"
                    >
                      <View className="w-10 h-10 rounded-2xl items-center justify-center mr-3" style={{ backgroundColor: med.color + '20' }}>
                        <Icon name="pills" fallback="medkit" size={18} color={med.color} />
                      </View>
                      <View className="flex-1">
                        <Typography variant="body" className="text-surface-900 font-medium">
                          {med.name}
                        </Typography>
                        <Typography variant="small" className="text-surface-500">
                          Ends {med.endDate ? format(new Date(med.endDate), 'MMM d, yyyy') : 'N/A'}
                        </Typography>
                      </View>
                      <Icon name="chevron.right" fallback="chevron-forward" size={20} color="#A3A3A3" />
                    </Pressable>
                  ))}
                  <Pressable onPress={() => setShowDependencyPicker(false)} className="px-4 py-3">
                    <Typography variant="body" className="text-surface-600 text-center">
                      Cancel
                    </Typography>
                  </Pressable>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Start date */}
          {!formData.dependsOnMedicationId ? (
            <View className="mb-6">
              <Typography variant="label" className="text-surface-600 mb-2 uppercase tracking-wider text-xs">
                Start date
              </Typography>
              <Input
                value={fmt(formData.startDate)}
                onChangeText={(text) => {
                  const d = new Date(text);
                  if (!isNaN(d.getTime())) updateFormData({ startDate: d });
                }}
                placeholder="YYYY-MM-DD"
                size="lg"
              />
              <Typography variant="small" className="text-surface-500 mt-2">
                Format: YYYY-MM-DD
              </Typography>
            </View>
          ) : null}

          {/* End date toggle */}
          <Pressable
            onPress={() =>
              updateFormData({
                hasEndDate: !formData.hasEndDate,
                endDate: !formData.hasEndDate ? addDays(formData.startDate, 7) : null,
              })
            }
            className={`flex-row items-center p-4 rounded-2xl border ${formData.hasEndDate ? 'border-primary-500 bg-primary-50' : 'border-surface-100 bg-white'}`}
          >
            <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${formData.hasEndDate ? 'bg-primary-100' : 'bg-surface-100'}`}>
              <Icon name="calendar" fallback="calendar" size={22} color={formData.hasEndDate ? '#06B6D4' : '#737373'} />
            </View>
            <View className="flex-1">
              <Typography variant="body" className={`font-semibold ${formData.hasEndDate ? 'text-primary-700' : 'text-surface-900'}`}>
                Has an end date
              </Typography>
              <Typography variant="small" className="text-surface-500">
                For short courses or prescriptions
              </Typography>
            </View>
            {formData.hasEndDate ? (
              <View className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center">
                <Icon name="checkmark" fallback="check" size={16} color="#fff" />
              </View>
            ) : (
              <View className="w-6 h-6 rounded-full bg-surface-200" />
            )}
          </Pressable>

          {formData.hasEndDate ? (
            <View className="mt-5">
              <Typography variant="label" className="text-surface-600 mb-2 uppercase tracking-wider text-xs">
                End date
              </Typography>
              <Input
                value={formData.endDate ? fmt(formData.endDate) : ''}
                onChangeText={(text) => {
                  const d = new Date(text);
                  if (!isNaN(d.getTime())) updateFormData({ endDate: d });
                }}
                placeholder="YYYY-MM-DD"
                size="lg"
              />

              <Typography variant="label" className="text-surface-600 mt-5 mb-2 uppercase tracking-wider text-xs">
                Quick duration
              </Typography>
              <View className="flex-row flex-wrap gap-2">
                {QUICK_DURATIONS.map((d) => {
                  const end = addDays(formData.startDate, d.days);
                  const selected = formData.endDate && fmt(formData.endDate) === fmt(end);
                  return (
                    <Pressable
                      key={d.days}
                      onPress={() => updateFormData({ endDate: end })}
                      className={`px-4 py-2.5 rounded-xl ${selected ? 'bg-primary-500' : 'bg-surface-100'}`}
                    >
                      <Typography variant="body" className={`font-medium ${selected ? 'text-white' : 'text-surface-700'}`}>
                        {d.label}
                      </Typography>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : (
            <View className="mt-5 bg-surface-100 rounded-2xl p-4">
              <View className="flex-row items-start">
                <View className="w-10 h-10 rounded-2xl bg-white items-center justify-center mr-3">
                  <Icon name="infinity" fallback="repeat" size={22} color="#737373" />
                </View>
                <View className="flex-1">
                  <Typography variant="body" className="text-surface-900 font-medium mb-1">
                    Ongoing medication
                  </Typography>
                  <Typography variant="small" className="text-surface-600">
                    Continues until you archive it.
                  </Typography>
                </View>
              </View>
            </View>
          )}
        </View>
      </Screen>

      <View className="px-6 pt-4 bg-white border-t border-surface-100" style={{ paddingBottom: insets.bottom + 16 }}>
        <View className="flex-row gap-3">
          <Button title="Back" variant="secondary" size="lg" onPress={() => router.back()} className="flex-1" />
          <Button title="Next" size="lg" onPress={() => router.push('/medication/refill')} className="flex-1" />
        </View>
      </View>
    </View>
  );
}

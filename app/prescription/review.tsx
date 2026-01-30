import React, { useState } from 'react';
import { Alert, View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppHeader } from '../../src/components/layout/AppHeader';
import { Screen } from '../../src/components/layout/Screen';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { Icon } from '../../src/components/ui/Icon';
import { ExtractedMedicationCard } from '../../src/components/prescription';
import { usePrescriptionImport } from '../../src/contexts';
import { MedicationService } from '../../src/services/medication.service';
import type { PrescriptionMedicationDraft } from '../../src/services/prescriptionVision.service';

const WEEKDAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

const SCHEDULE_TYPES = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Interval', value: 'interval' },
  { label: 'As needed', value: 'as-needed' },
];

const MEAL_OPTIONS = [
  { label: 'Before meal', value: 'before' },
  { label: 'After meal', value: 'after' },
  { label: 'With food', value: 'with' },
  { label: 'Anytime', value: 'anytime' },
];

const COMMON_SCHEDULES = [
  { label: '1× / day', times: ['08:00'] },
  { label: '2× / day', times: ['08:00', '20:00'] },
  { label: '3× / day', times: ['08:00', '14:00', '20:00'] },
  { label: '4× / day', times: ['08:00', '12:00', '16:00', '20:00'] },
];

const COLOR_OPTIONS = ['#06B6D4', '#F97316', '#8B5CF6', '#22C55E', '#EF4444', '#6366F1'];

type EditMode = 'basic' | 'advanced';

function formatSchedule(med: PrescriptionMedicationDraft): string {
  const times = (med.scheduleTimes ?? []).join(', ');
  if (med.scheduleType === 'daily') return times.length ? `Daily · ${times}` : 'Daily';
  if (med.scheduleType === 'weekly') {
    const days = (med.scheduleWeekdays ?? [])
      .map((v) => WEEKDAYS.find((x) => x.value === v)?.label)
      .filter(Boolean)
      .join(', ');
    return `${days || 'Weekly'}${times ? ` · ${times}` : ''}`;
  }
  if (med.scheduleType === 'interval') {
    const h = med.scheduleIntervalHours ?? 6;
    const start = med.scheduleTimes?.[0] ? ` · start ${med.scheduleTimes[0]}` : '';
    return `Every ${h}h${start}`;
  }
  return 'As needed';
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Animated.View
      entering={FadeIn}
      className={`px-4 py-2.5 rounded-2xl ${
        selected ? 'bg-primary-500' : 'bg-surface-100'
      }`}
    >
      <Typography
        variant="small"
        className={selected ? 'text-white font-semibold' : 'text-surface-700 font-medium'}
        onPress={onPress}
      >
        {label}
      </Typography>
    </Animated.View>
  );
}

interface EditModalProps {
  medication: PrescriptionMedicationDraft;
  visible: boolean;
  onClose: () => void;
  onSave: (updates: Partial<PrescriptionMedicationDraft>) => void;
}

function EditModal({ medication, visible, onClose, onSave }: EditModalProps) {
  if (!visible) return null;

  const [editMode, setEditMode] = useState<EditMode>('basic');
  const [localDraft, setLocalDraft] = useState(medication);

  const updateField = (field: keyof PrescriptionMedicationDraft, value: any) => {
    setLocalDraft((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(localDraft);
    onClose();
  };

  return (
    <View className="absolute inset-0 bg-black/50 z-10 items-center justify-end">
      <View className="bg-white rounded-t-3xl w-full max-h-[90%]">
        <View className="p-6 border-b border-surface-100">
          <View className="flex-row items-center justify-between">
            <Typography variant="h2" className="text-surface-900 font-semibold">
              Edit medication
            </Typography>
            <Button title="Cancel" variant="ghost" size="sm" onPress={onClose} />
          </View>
        </View>

        <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
          {/* Basic Mode */}
          {editMode === 'basic' && (
            <View className="gap-5">
              <Typography variant="label" className="text-surface-500 uppercase tracking-wider text-xs">
                Details
              </Typography>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Typography variant="small" className="text-surface-600 mb-2">
                    Name
                  </Typography>
                  <View className="bg-surface-50 rounded-2xl px-4 py-3 border border-surface-200">
                    <Typography variant="body" className="text-surface-900">
                      {localDraft.name}
                    </Typography>
                  </View>
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Typography variant="small" className="text-surface-600 mb-2">
                    Dosage
                  </Typography>
                  <View className="bg-surface-50 rounded-2xl px-4 py-3 border border-surface-200">
                    <Typography variant="body" className="text-surface-900">
                      {localDraft.dosage}
                    </Typography>
                  </View>
                </View>
                <View className="w-36">
                  <Typography variant="small" className="text-surface-600 mb-2">
                    Unit
                  </Typography>
                  <View className="bg-surface-50 rounded-2xl px-4 py-3 border border-surface-200">
                    <Typography variant="body" className="text-surface-900">
                      {localDraft.dosageUnit}
                    </Typography>
                  </View>
                </View>
              </View>

              <View>
                <Typography variant="small" className="text-surface-600 mb-2">
                  Meal timing
                </Typography>
                <View className="flex-row flex-wrap gap-2">
                  {MEAL_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.value}
                      label={opt.label}
                      selected={localDraft.mealTiming === opt.value}
                      onPress={() => updateField('mealTiming', opt.value)}
                    />
                  ))}
                </View>
              </View>

              <View>
                <Typography variant="small" className="text-surface-600 mb-2">
                  Schedule type
                </Typography>
                <View className="flex-row flex-wrap gap-2">
                  {SCHEDULE_TYPES.map((t) => (
                    <Chip
                      key={t.value}
                      label={t.label}
                      selected={localDraft.scheduleType === t.value}
                      onPress={() => {
                        if (t.value === 'as-needed') {
                          updateField('scheduleType', t.value);
                          updateField('scheduleTimes', []);
                          updateField('scheduleWeekdays', []);
                        } else if (t.value === 'interval') {
                          updateField('scheduleType', t.value);
                          updateField('scheduleIntervalHours', 6);
                          updateField('scheduleTimes', ['08:00']);
                          updateField('scheduleWeekdays', []);
                        } else if (t.value === 'weekly') {
                          updateField('scheduleType', t.value);
                          updateField('scheduleWeekdays', [1, 3, 5]);
                          updateField('scheduleTimes', ['08:00']);
                        } else {
                          updateField('scheduleType', t.value);
                          updateField('scheduleTimes', ['08:00']);
                          updateField('scheduleWeekdays', []);
                        }
                      }}
                    />
                  ))}
                </View>
              </View>

              {localDraft.scheduleType === 'daily' && (
                <View>
                  <Typography variant="small" className="text-surface-600 mb-2">
                    Quick select
                  </Typography>
                  <View className="flex-row flex-wrap gap-2 mb-3">
                    {COMMON_SCHEDULES.map((s) => (
                      <Chip
                        key={s.label}
                        label={s.label}
                        selected={JSON.stringify(localDraft.scheduleTimes) === JSON.stringify(s.times)}
                        onPress={() => {
                          updateField('scheduleType', 'daily');
                          updateField('scheduleTimes', s.times);
                        }}
                      />
                    ))}
                  </View>
                  <Typography variant="small" className="text-surface-600 mb-2">
                    Times (24h format)
                  </Typography>
                  <View className="gap-2">
                    {(localDraft.scheduleTimes ?? []).map((t: string, i: number) => (
                      <View key={i} className="bg-surface-50 rounded-2xl px-4 py-3 border border-surface-200 flex-row items-center justify-between">
                        <Typography variant="body" className="text-surface-900">
                          {t}
                        </Typography>
                        {(localDraft.scheduleTimes?.length ?? 0) > 1 && (
                          <Button
                            title="Remove"
                            variant="ghost"
                            size="sm"
                            onPress={() => {
                              const times = [...(localDraft.scheduleTimes ?? [])];
                              times.splice(i, 1);
                              updateField('scheduleTimes', times);
                            }}
                          />
                        )}
                      </View>
                    ))}
                    <Button
                      title="+ Add time"
                      variant="outline"
                      size="md"
                      onPress={() => {
                        updateField('scheduleTimes', [...(localDraft.scheduleTimes ?? []), '12:00']);
                      }}
                      fullWidth
                    />
                  </View>
                </View>
              )}

              {localDraft.scheduleType === 'weekly' && (
                <View>
                  <Typography variant="small" className="text-surface-600 mb-2">
                    Days
                  </Typography>
                  <View className="flex-row flex-wrap gap-2 mb-3">
                    {WEEKDAYS.map((d) => (
                      <Chip
                        key={d.value}
                        label={d.label}
                        selected={localDraft.scheduleWeekdays?.includes(d.value)}
                        onPress={() => {
                          const days = localDraft.scheduleWeekdays ?? [];
                          const next = days.includes(d.value)
                            ? days.filter((day) => day !== d.value)
                            : [...days, d.value];
                          updateField('scheduleWeekdays', next.sort((a, b) => a - b));
                        }}
                      />
                    ))}
                  </View>
                  <Typography variant="small" className="text-surface-600 mb-2">
                    Times
                  </Typography>
                  <View className="gap-2">
                    {(localDraft.scheduleTimes ?? []).map((t: string, i: number) => (
                      <View key={i} className="bg-surface-50 rounded-2xl px-4 py-3 border border-surface-200 flex-row items-center justify-between">
                        <Typography variant="body" className="text-surface-900">
                          {t}
                        </Typography>
                        {(localDraft.scheduleTimes?.length ?? 0) > 1 && (
                          <Button
                            title="Remove"
                            variant="ghost"
                            size="sm"
                            onPress={() => {
                              const times = [...(localDraft.scheduleTimes ?? [])];
                              times.splice(i, 1);
                              updateField('scheduleTimes', times);
                            }}
                          />
                        )}
                      </View>
                    ))}
                    <Button
                      title="+ Add time"
                      variant="outline"
                      size="md"
                      onPress={() => {
                        updateField('scheduleTimes', [...(localDraft.scheduleTimes ?? []), '12:00']);
                      }}
                      fullWidth
                    />
                  </View>
                </View>
              )}

              {localDraft.scheduleType === 'interval' && (
                <View className="gap-3">
                  <View>
                    <Typography variant="small" className="text-surface-600 mb-2">
                      Every X hours
                    </Typography>
                    <View className="bg-surface-50 rounded-2xl px-4 py-3 border border-surface-200">
                      <Typography variant="body" className="text-surface-900">
                        {localDraft.scheduleIntervalHours ?? 6} hours
                      </Typography>
                    </View>
                  </View>
                  <View>
                    <Typography variant="small" className="text-surface-600 mb-2">
                      Start time
                    </Typography>
                    <View className="bg-surface-50 rounded-2xl px-4 py-3 border border-surface-200">
                      <Typography variant="body" className="text-surface-900">
                        {localDraft.scheduleTimes?.[0] ?? '08:00'}
                      </Typography>
                    </View>
                  </View>
                </View>
              )}

              {localDraft.scheduleType === 'as-needed' && (
                <View className="bg-accent-50 rounded-2xl p-4 border border-accent-100">
                  <Typography variant="small" className="text-surface-700">
                    No fixed reminders. You can log doses manually.
                  </Typography>
                </View>
              )}

              <Button
                title="Show advanced options"
                variant="outline"
                size="md"
                onPress={() => setEditMode('advanced')}
                fullWidth
              />
            </View>
          )}

          {/* Advanced Mode */}
          {editMode === 'advanced' && (
            <View className="gap-5">
              <Typography variant="label" className="text-surface-500 uppercase tracking-wider text-xs">
                Advanced options
              </Typography>

              <View>
                <Typography variant="small" className="text-surface-600 mb-2">
                  Start date
                </Typography>
                <View className="bg-surface-50 rounded-2xl px-4 py-3 border border-surface-200">
                  <Typography variant="body" className="text-surface-900">
                    {localDraft.startDate?.toISOString().split('T')[0] ?? 'Today'}
                  </Typography>
                </View>
              </View>

              <View>
                <Typography variant="small" className="text-surface-600 mb-2">
                  Color
                </Typography>
                <View className="flex-row flex-wrap gap-3">
                  {COLOR_OPTIONS.map((c) => (
                    <View
                      key={c}
                      className={`w-10 h-10 rounded-2xl ${
                        localDraft.color === c ? 'border-2 border-surface-900' : 'border border-surface-200'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </View>
              </View>

              <Button
                title="Back to basic options"
                variant="outline"
                size="md"
                onPress={() => setEditMode('basic')}
                fullWidth
              />
            </View>
          )}
        </ScrollView>

        <View className="p-6 border-t border-surface-100">
          <Button title="Save changes" variant="primary" onPress={handleSave} fullWidth />
        </View>
      </View>
    </View>
  );
}

export default function PrescriptionReviewScreen() {
  const { drafts, setDrafts, reset } = usePrescriptionImport();
  const [isSaving, setIsSaving] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const hasDrafts = drafts.length > 0;

  const summary = `${drafts.length} medication${drafts.length === 1 ? '' : 's'}`;

  const toggleCard = (index: number) => {
    setExpandedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const removeDraft = (index: number) => {
    Alert.alert(
      'Remove medication?',
      'This medication will be removed from the list.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newDrafts = drafts.filter((_, i) => i !== index);
            setDrafts(newDrafts);

            // Update expanded cards indices
            const newExpanded: Record<number, boolean> = {};
            Object.entries(expandedCards)
              .filter(([key]) => parseInt(key, 10) < index)
              .forEach(([key, value]) => {
                newExpanded[parseInt(key, 10)] = value;
              });
            setExpandedCards(newExpanded);
          },
        },
      ]
    );
  };

  const saveAll = async () => {
    const cleaned = drafts
      .map((d) => ({
        ...d,
        name: d.name.trim(),
        dosage: d.dosage.trim(),
        dosageUnit: d.dosageUnit.trim(),
      }))
      .filter((d) => d.name.length > 0);

    if (!cleaned.length) {
      Alert.alert('Nothing to add', 'No valid medications found.');
      return;
    }

    try {
      setIsSaving(true);

      const createdByName: Record<string, string> = {};
      for (const d of cleaned) {
        const { dependsOnMedicationName, ...rest } = d as any;
        const toCreate = { ...rest, dependsOnMedicationId: null };
        const created = await MedicationService.create(toCreate);
        createdByName[created.name.toLowerCase()] = created.id;
      }

      for (const d of cleaned) {
        const dep = (d as any).dependsOnMedicationName as string | null | undefined;
        if (!dep) continue;
        const depId = createdByName[dep.toLowerCase()];
        if (!depId) continue;
        const targetId = createdByName[d.name.toLowerCase()];
        if (!targetId) continue;

        await MedicationService.update(targetId, {
          dependsOnMedicationId: depId,
          dependsOnOffsetDays: d.dependsOnOffsetDays ?? 0,
        } as any);
      }

      reset();
      router.replace('/(tabs)/medications');
    } catch (e: any) {
      Alert.alert('Failed to add medications', e?.message ?? 'Please try again.');
      setIsSaving(false);
    }
  };

  if (!hasDrafts) {
    return (
      <View className="flex-1 bg-surface-50">
        <AppHeader title="Review" subtitle="Prescription" />
        <Screen includeTopInset={false} padX={16} padY={16}>
          <View className="flex-1 items-center justify-center py-12">
            <View className="w-24 h-24 rounded-3xl bg-surface-100 items-center justify-center mb-6">
              <Icon name="doc.text.fill" fallback="document-text" size={40} color="#A3A3A3" />
            </View>
            <Typography variant="h3" className="text-surface-900 font-semibold mb-3">
              Nothing to review
            </Typography>
            <Typography variant="body" className="text-surface-600 text-center mb-8 px-4">
              No medications were extracted from the prescription. Please go back and try scanning again.
            </Typography>
            <Button title="Go back" variant="primary" onPress={() => router.back()} fullWidth />
          </View>
        </Screen>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-50">
      <AppHeader
        title="Review"
        subtitle="Prescription"
        right={
          <Button
            title="New scan"
            variant="ghost"
            size="sm"
            onPress={() => {
              reset();
              router.push('/prescription/import');
            }}
          />
        }
      />

      <Screen scroll includeTopInset={false} padX={16} padY={16} padBottomExtra={120}>
        <Animated.View entering={FadeIn} className="mb-6">
          <Typography variant="body" className="text-surface-600">
            {summary} extracted from your prescription. Review each one below, then tap "Add all" to import them.
          </Typography>
        </Animated.View>

        <View className="gap-3">
          {drafts.map((med, index) => (
            <ExtractedMedicationCard
              key={index}
              medication={med}
              index={index}
              isExpanded={expandedCards[index] ?? false}
              onToggleExpand={() => toggleCard(index)}
              onEdit={() => setEditingIndex(index)}
              onRemove={() => removeDraft(index)}
              onUpdateField={(field, value) => {
                const newDrafts = [...drafts];
                newDrafts[index] = { ...med, [field]: value };
                setDrafts(newDrafts);
              }}
            />
          ))}
        </View>
      </Screen>

      {/* Bottom Action Bar */}
      <View className="absolute left-0 right-0 bg-white border-t border-surface-100 px-6 pt-4 pb-6">
        <Button
          title={isSaving ? 'Adding medications...' : 'Add all medications'}
          variant="primary"
          onPress={saveAll}
          disabled={isSaving}
          fullWidth
          leftIcon={
            isSaving ? null : (
              <Icon name="checkmark.circle.fill" fallback="checkmark-circle" size={20} color="#fff" />
            )
          }
        />
      </View>

      {/* Edit Modal */}
      {editingIndex !== null && (
        <EditModal
          medication={drafts[editingIndex]}
          visible={editingIndex !== null}
          onClose={() => setEditingIndex(null)}
          onSave={(updates) => {
            const newDrafts = [...drafts];
            newDrafts[editingIndex] = { ...newDrafts[editingIndex], ...updates };
            setDrafts(newDrafts);
            setEditingIndex(null);
          }}
        />
      )}
    </View>
  );
}

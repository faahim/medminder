import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, Switch, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AppHeader } from '../../src/components/layout/AppHeader';
import { Screen } from '../../src/components/layout/Screen';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { usePrescriptionImport } from '../../src/contexts';
import { MedicationService } from '../../src/services/medication.service';
import type { PrescriptionMedicationDraft } from '../../src/services/prescriptionVision.service';
import type { MealTiming, ScheduleType } from '../../src/types';

const WEEKDAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

const SCHEDULE_TYPES: { label: string; value: ScheduleType }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Interval', value: 'interval' },
  { label: 'As needed', value: 'as-needed' },
];

const MEAL_OPTIONS: { label: string; value: MealTiming }[] = [
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

function safeISODate(d: Date) {
  return d.toISOString().split('T')[0];
}

function parseISODate(text: string): Date | null {
  const date = new Date(text);
  return isNaN(date.getTime()) ? null : date;
}

function formatSchedule(d: PrescriptionMedicationDraft): string {
  const times = (d.scheduleTimes ?? []).join(', ');
  if (d.scheduleType === 'daily') return times.length ? `Daily · ${times}` : 'Daily';
  if (d.scheduleType === 'weekly') {
    const days = (d.scheduleWeekdays ?? [])
      .map((v) => WEEKDAYS.find((x) => x.value === v)?.label)
      .filter(Boolean)
      .join(', ');
    return `${days || 'Weekly'}${times ? ` · ${times}` : ''}`;
  }
  if (d.scheduleType === 'interval') {
    const h = d.scheduleIntervalHours ?? 6;
    const start = d.scheduleTimes?.[0] ? ` · start ${d.scheduleTimes[0]}` : '';
    return `Every ${h}h${start}`;
  }
  return 'As needed';
}

function chipClass(selected: boolean) {
  return selected ? 'bg-primary-500' : 'bg-surface-100';
}

function chipTextClass(selected: boolean) {
  return selected ? 'text-white font-semibold' : 'text-surface-700 font-medium';
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Typography variant="label" className="text-surface-500 mb-3 uppercase tracking-wider text-xs">
      {children}
    </Typography>
  );
}

export default function PrescriptionReviewScreen() {
  const insets = useSafeAreaInsets();
  const { drafts, setDrafts, reset } = usePrescriptionImport();
  const [isSaving, setIsSaving] = useState(false);
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const [advanced, setAdvanced] = useState<Record<number, boolean>>({});

  const hasDrafts = drafts.length > 0;

  const summary = useMemo(() => {
    const meds = drafts.filter((d) => d.name.trim().length > 0);
    return `${meds.length} medication${meds.length === 1 ? '' : 's'}`;
  }, [drafts]);

  const updateDraft = (index: number, patch: Partial<PrescriptionMedicationDraft>) => {
    setDrafts(drafts.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  };

  const removeDraft = (index: number) => {
    setDrafts(drafts.filter((_, i) => i !== index));
  };

  const setScheduleType = (index: number, scheduleType: ScheduleType) => {
    const cur = drafts[index];

    if (scheduleType === 'as-needed') {
      updateDraft(index, { scheduleType, scheduleTimes: [], scheduleWeekdays: [] });
      return;
    }

    if (scheduleType === 'interval') {
      updateDraft(index, {
        scheduleType,
        scheduleIntervalHours: cur.scheduleIntervalHours || 6,
        scheduleTimes: cur.scheduleTimes?.length ? [cur.scheduleTimes[0]] : ['08:00'],
        scheduleWeekdays: [],
      });
      return;
    }

    if (scheduleType === 'weekly') {
      updateDraft(index, {
        scheduleType,
        scheduleWeekdays: cur.scheduleWeekdays?.length ? cur.scheduleWeekdays : [1, 3, 5],
        scheduleTimes: cur.scheduleTimes?.length ? cur.scheduleTimes : ['08:00'],
      });
      return;
    }

    updateDraft(index, {
      scheduleType,
      scheduleTimes: cur.scheduleTimes?.length ? cur.scheduleTimes : ['08:00'],
      scheduleWeekdays: [],
    });
  };

  const toggleWeekday = (index: number, day: number) => {
    const cur = drafts[index].scheduleWeekdays ?? [];
    const next = cur.includes(day) ? cur.filter((d) => d !== day) : [...cur, day];
    next.sort((a, b) => a - b);
    updateDraft(index, { scheduleWeekdays: next });
  };

  const handleAddTime = (index: number) => {
    const cur = drafts[index].scheduleTimes ?? [];
    updateDraft(index, { scheduleTimes: [...cur, '12:00'] });
  };

  const handleRemoveTime = (index: number, timeIndex: number) => {
    const cur = drafts[index].scheduleTimes ?? [];
    updateDraft(index, { scheduleTimes: cur.filter((_, i) => i !== timeIndex) });
  };

  const handleTimeChange = (index: number, timeIndex: number, value: string) => {
    const cur = drafts[index].scheduleTimes ?? [];
    const next = [...cur];
    next[timeIndex] = value;
    updateDraft(index, { scheduleTimes: next });
  };

  const setQuickDaily = (index: number, times: string[]) => {
    updateDraft(index, { scheduleType: 'daily', scheduleTimes: times });
  };

  const saveAll = async () => {
    const cleaned = drafts
      .map((d) => ({ ...d, name: d.name.trim(), dosage: d.dosage.trim(), dosageUnit: d.dosageUnit.trim() }))
      .filter((d) => d.name.length > 0);

    if (!cleaned.length) {
      Alert.alert('Nothing to add', 'No valid medications found.');
      return;
    }

    const invalid = cleaned.find((d) => {
      if (d.scheduleType === 'daily') return !(d.scheduleTimes?.length);
      if (d.scheduleType === 'weekly') return !(d.scheduleTimes?.length) || !(d.scheduleWeekdays?.length);
      if (d.scheduleType === 'interval') return !(d.scheduleIntervalHours > 0) || !(d.scheduleTimes?.[0]);
      return false;
    });

    if (invalid) {
      Alert.alert('Missing schedule details', 'One or more medications are missing schedule info. Please review and try again.');
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
    } finally {
      setIsSaving(false);
    }
  };

  if (!hasDrafts) {
    return (
      <View className="flex-1 bg-surface-50">
        <AppHeader title="Review" subtitle="Prescription" />
        <Screen includeTopInset={false} padX={16} padY={16}>
          <Typography variant="body" className="text-surface-600">
            Nothing to review. Go back and scan a prescription.
          </Typography>
          <View className="mt-6">
            <Button title="Back" variant="primary" onPress={() => router.back()} />
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
        right={<Button title="Edit photo" variant="ghost" size="sm" onPress={() => router.back()} />}
      />

      <Screen scroll includeTopInset={false} padX={16} padY={16} padBottomExtra={insets.bottom + 120}>
        <Typography variant="body" className="text-surface-600 mb-4">
          {summary} extracted. Review, adjust, then add all.
        </Typography>

        <FlatList
          data={drafts}
          keyExtractor={(_, i) => String(i)}
          scrollEnabled={false}
          renderItem={({ item, index }) => {
            const isOpen = open[index] ?? true;
            const isAdvanced = advanced[index] ?? false;
            const title = item.name?.trim() || `Medication ${index + 1}`;
            const subtitle = `${item.dosage || ''} ${item.dosageUnit || ''}`.trim();

            return (
              <View className="bg-white rounded-3xl border border-surface-100 p-5 mb-3">
                {/* Header */}
                <Pressable
                  onPress={() => setOpen((p) => ({ ...p, [index]: !isOpen }))}
                  className="flex-row items-center justify-between"
                  accessibilityRole="button"
                  accessibilityLabel={`Toggle details for ${title}`}
                >
                  <View className="flex-1 pr-3">
                    <Typography variant="h3" className="text-surface-900">
                      {title}
                    </Typography>
                    <Typography variant="small" className="text-surface-500 mt-0.5">
                      {subtitle ? `${subtitle} · ` : ''}
                      {formatSchedule(item)}
                    </Typography>
                  </View>
                  <Pressable onPress={() => removeDraft(index)} className="w-10 h-10 rounded-2xl bg-surface-100 items-center justify-center">
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </Pressable>
                </Pressable>

                {!isOpen ? null : (
                  <View className="mt-5">
                    {/* Basics */}
                    <View className="gap-3">
                      <Input label="Name" value={item.name} onChangeText={(t) => updateDraft(index, { name: t })} placeholder="e.g., Domperidone" size="lg" />

                      <View className="flex-row gap-3">
                        <View className="flex-1">
                          <Input label="Dosage" value={item.dosage} onChangeText={(t) => updateDraft(index, { dosage: t })} placeholder="10" size="lg" />
                        </View>
                        <View className="w-36">
                          <Input label="Unit" value={item.dosageUnit} onChangeText={(t) => updateDraft(index, { dosageUnit: t })} placeholder="tablet" size="lg" />
                        </View>
                      </View>
                    </View>

                    {/* Meal timing */}
                    <View className="mt-6">
                      <SectionTitle>Meal timing</SectionTitle>
                      <View className="flex-row flex-wrap gap-2">
                        {MEAL_OPTIONS.map((opt) => {
                          const selected = item.mealTiming === opt.value;
                          return (
                            <Pressable key={opt.value} onPress={() => updateDraft(index, { mealTiming: opt.value })} className={`px-4 py-3 rounded-2xl ${chipClass(selected)}`}>
                              <Typography variant="small" className={chipTextClass(selected)}>
                                {opt.label}
                              </Typography>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>

                    {/* Schedule */}
                    <View className="mt-6">
                      <SectionTitle>Schedule</SectionTitle>

                      <View className="flex-row flex-wrap gap-2">
                        {SCHEDULE_TYPES.map((t) => {
                          const selected = item.scheduleType === t.value;
                          return (
                            <Pressable key={t.value} onPress={() => setScheduleType(index, t.value)} className={`px-4 py-3 rounded-2xl ${chipClass(selected)}`}>
                              <Typography variant="small" className={chipTextClass(selected)}>
                                {t.label}
                              </Typography>
                            </Pressable>
                          );
                        })}
                      </View>

                      {item.scheduleType === 'daily' ? (
                        <View className="mt-4">
                          <Typography variant="small" className="text-surface-500 mb-2">
                            Quick select
                          </Typography>
                          <View className="flex-row flex-wrap gap-2">
                            {COMMON_SCHEDULES.map((s) => {
                              const selected = JSON.stringify(item.scheduleTimes) === JSON.stringify(s.times);
                              return (
                                <Button key={s.label} title={s.label} size="sm" variant={selected ? 'primary' : 'outline'} onPress={() => setQuickDaily(index, s.times)} />
                              );
                            })}
                          </View>

                          <Typography variant="small" className="text-surface-500 mt-4 mb-2">
                            Times (24h, e.g., 08:00)
                          </Typography>
                          <View className="gap-3">
                            {(item.scheduleTimes ?? []).map((t, i) => (
                              <View key={`${index}-t-${i}`} className="flex-row items-center gap-2">
                                <View className="flex-1">
                                  <Input value={t} onChangeText={(v) => handleTimeChange(index, i, v)} placeholder="08:00" keyboardType="number-pad" size="lg" />
                                </View>
                                {(item.scheduleTimes?.length ?? 0) > 1 ? (
                                  <Pressable onPress={() => handleRemoveTime(index, i)} className="w-12 h-12 rounded-2xl bg-danger-50 items-center justify-center">
                                    <Ionicons name="close" size={18} color="#EF4444" />
                                  </Pressable>
                                ) : null}
                              </View>
                            ))}
                            <Button title="+ Add another time" variant="outline" size="lg" onPress={() => handleAddTime(index)} fullWidth />
                          </View>
                        </View>
                      ) : null}

                      {item.scheduleType === 'weekly' ? (
                        <View className="mt-4">
                          <Typography variant="small" className="text-surface-500 mb-2">
                            Days of week
                          </Typography>
                          <View className="flex-row flex-wrap gap-2">
                            {WEEKDAYS.map((d) => {
                              const selected = item.scheduleWeekdays?.includes(d.value);
                              return (
                                <Pressable key={d.value} onPress={() => toggleWeekday(index, d.value)} className={`px-4 py-3 rounded-2xl ${chipClass(!!selected)}`}>
                                  <Typography variant="small" className={chipTextClass(!!selected)}>
                                    {d.label}
                                  </Typography>
                                </Pressable>
                              );
                            })}
                          </View>

                          <Typography variant="small" className="text-surface-500 mt-4 mb-2">
                            Times
                          </Typography>
                          <View className="gap-3">
                            {(item.scheduleTimes ?? []).map((t, i) => (
                              <View key={`${index}-wt-${i}`} className="flex-row items-center gap-2">
                                <View className="flex-1">
                                  <Input value={t} onChangeText={(v) => handleTimeChange(index, i, v)} placeholder="08:00" keyboardType="number-pad" size="lg" />
                                </View>
                                {(item.scheduleTimes?.length ?? 0) > 1 ? (
                                  <Pressable onPress={() => handleRemoveTime(index, i)} className="w-12 h-12 rounded-2xl bg-danger-50 items-center justify-center">
                                    <Ionicons name="close" size={18} color="#EF4444" />
                                  </Pressable>
                                ) : null}
                              </View>
                            ))}
                            <Button title="+ Add another time" variant="outline" size="lg" onPress={() => handleAddTime(index)} fullWidth />
                          </View>
                        </View>
                      ) : null}

                      {item.scheduleType === 'interval' ? (
                        <View className="mt-4 gap-3">
                          <Input
                            label="Every X hours"
                            value={String(item.scheduleIntervalHours ?? 6)}
                            onChangeText={(v) => {
                              const n = Number(v);
                              updateDraft(index, { scheduleIntervalHours: Number.isFinite(n) ? n : 6 });
                            }}
                            placeholder="6"
                            keyboardType="number-pad"
                            size="lg"
                          />
                          <Input
                            label="Start time (24h)"
                            value={item.scheduleTimes?.[0] ?? '08:00'}
                            onChangeText={(v) => updateDraft(index, { scheduleTimes: [v] })}
                            placeholder="08:00"
                            keyboardType="number-pad"
                            size="lg"
                          />
                        </View>
                      ) : null}

                      {item.scheduleType === 'as-needed' ? (
                        <View className="mt-4 bg-accent-50 rounded-2xl p-4 border border-accent-100">
                          <Typography variant="small" className="text-surface-700">
                            No fixed reminders. You can log doses manually.
                          </Typography>
                        </View>
                      ) : null}
                    </View>

                    {/* Advanced toggle */}
                    <View className="mt-6 flex-row items-center justify-between bg-surface-100 p-4 rounded-2xl">
                      <View className="flex-1 pr-4">
                        <Typography variant="body" className="text-surface-900 font-medium">
                          Advanced details
                        </Typography>
                        <Typography variant="small" className="text-surface-500">
                          Dates, protocol, and color
                        </Typography>
                      </View>
                      <Switch
                        value={isAdvanced}
                        onValueChange={(v) => setAdvanced((p) => ({ ...p, [index]: v }))}
                        trackColor={{ false: '#E0E0E0', true: '#06B6D480' }}
                        thumbColor={isAdvanced ? '#06B6D4' : '#f4f3f4'}
                      />
                    </View>

                    {isAdvanced ? (
                      <View className="mt-5 gap-4">
                        <View>
                          <SectionTitle>Duration</SectionTitle>
                          <Input
                            label="Start date"
                            value={safeISODate(item.startDate)}
                            onChangeText={(text) => {
                              const d = parseISODate(text);
                              if (d) updateDraft(index, { startDate: d });
                            }}
                            placeholder="YYYY-MM-DD"
                            size="lg"
                          />

                          <View className="mt-4 flex-row items-center justify-between bg-surface-100 p-4 rounded-2xl">
                            <View className="flex-1 pr-4">
                              <Typography variant="body" className="text-surface-900 font-medium">
                                Has an end date
                              </Typography>
                              <Typography variant="small" className="text-surface-500">
                                For temporary courses
                              </Typography>
                            </View>
                            <Switch
                              value={item.hasEndDate}
                              onValueChange={(value) => {
                                const endDate = value ? new Date(item.startDate.getTime() + 7 * 24 * 60 * 60 * 1000) : null;
                                updateDraft(index, { hasEndDate: value, endDate });
                              }}
                              trackColor={{ false: '#E0E0E0', true: '#06B6D480' }}
                              thumbColor={item.hasEndDate ? '#06B6D4' : '#f4f3f4'}
                            />
                          </View>

                          {item.hasEndDate ? (
                            <View className="mt-4">
                              <Input
                                label="End date"
                                value={item.endDate ? safeISODate(item.endDate) : ''}
                                onChangeText={(text) => {
                                  const d = parseISODate(text);
                                  if (d) updateDraft(index, { endDate: d });
                                }}
                                placeholder="YYYY-MM-DD"
                                size="lg"
                              />
                            </View>
                          ) : null}
                        </View>

                        <View>
                          <SectionTitle>Protocol</SectionTitle>
                          <Input
                            label="Start after completing (optional)"
                            value={(item as any).dependsOnMedicationName ?? ''}
                            onChangeText={(t) => updateDraft(index, { dependsOnMedicationName: t } as any)}
                            placeholder="e.g., VONOCAB TRIO KIT"
                            size="lg"
                          />
                          <View className="mt-3">
                            <Input
                              label="Offset days"
                              value={String(item.dependsOnOffsetDays ?? 0)}
                              onChangeText={(v) => {
                                const n = Number(v);
                                updateDraft(index, { dependsOnOffsetDays: Number.isFinite(n) ? n : 0 });
                              }}
                              placeholder="0"
                              keyboardType="number-pad"
                              size="lg"
                            />
                          </View>
                        </View>

                        <View>
                          <SectionTitle>Color</SectionTitle>
                          <View className="flex-row flex-wrap gap-3">
                            {COLOR_OPTIONS.map((c) => {
                              const selected = item.color === c;
                              return (
                                <Pressable
                                  key={c}
                                  onPress={() => updateDraft(index, { color: c })}
                                  className={`w-10 h-10 rounded-2xl ${selected ? 'border-2 border-surface-900' : 'border border-surface-200'}`}
                                  style={{ backgroundColor: c }}
                                  accessibilityRole="button"
                                  accessibilityLabel={`Select color ${c}`}
                                />
                              );
                            })}
                          </View>
                        </View>

                        <Input
                          label="Instructions / Notes"
                          value={item.instructions}
                          onChangeText={(t) => updateDraft(index, { instructions: t })}
                          placeholder="Before meal, for 2 weeks…"
                          multiline
                          size="lg"
                          style={{ minHeight: 110, textAlignVertical: 'top' } as any}
                        />
                      </View>
                    ) : (
                      <View className="mt-5">
                        <Input
                          label="Instructions / Notes"
                          value={item.instructions}
                          onChangeText={(t) => updateDraft(index, { instructions: t })}
                          placeholder="Before meal, for 2 weeks…"
                          multiline
                          size="lg"
                          style={{ minHeight: 90, textAlignVertical: 'top' } as any}
                        />
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          }}
        />
      </Screen>

      <View className="absolute left-0 right-0 bg-white border-t border-surface-100 px-6 pt-4" style={{ bottom: 0, paddingBottom: insets.bottom + 16 }}>
        <Button title={isSaving ? 'Adding…' : 'Add all medications'} variant="primary" onPress={saveAll} disabled={isSaving} fullWidth />
      </View>
    </View>
  );
}

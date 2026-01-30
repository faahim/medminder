import React from 'react';
import { View } from 'react-native';
import { Icon } from '../ui/Icon';
import { Typography } from '../ui/Typography';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { usePressAnimation } from '../../hooks/usePressAnimation';
import { useStaggeredAnimation } from '../../hooks/useStaggeredAnimation';
import Animated from 'react-native-reanimated';
import type { PrescriptionMedicationDraft } from '../../services/prescriptionVision.service';
import type { MealTiming, ScheduleType } from '../../types';

const MEAL_LABELS: Record<MealTiming, string> = {
  before: 'Before meal',
  after: 'After meal',
  with: 'With food',
  anytime: 'Anytime',
};

const SCHEDULE_LABELS: Record<ScheduleType, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  interval: 'Interval',
  'as-needed': 'As needed',
};

interface ExtractedMedicationCardProps {
  medication: PrescriptionMedicationDraft;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onRemove: () => void;
  onUpdateField: (field: keyof PrescriptionMedicationDraft, value: any) => void;
}

export function ExtractedMedicationCard({
  medication,
  index,
  isExpanded,
  onToggleExpand,
  onEdit,
  onRemove,
  onUpdateField,
}: ExtractedMedicationCardProps) {
  const entering = useStaggeredAnimation(index);
  const { animatedStyle, onPressIn, onPressOut } = usePressAnimation(0.98);

  const title = medication.name?.trim() || `Medication ${index + 1}`;
  const subtitle = `${medication.dosage || ''} ${medication.dosageUnit || ''}`.trim();

  return (
    <Animated.View entering={entering}>
      <Card className="overflow-hidden">
        <Animated.View style={animatedStyle}>
          {/* Header - always visible */}
          <View className="p-5">
            <View className="flex-row items-start gap-3">
              {/* Color indicator */}
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center flex-shrink-0"
                style={{ backgroundColor: medication.color + '15' }}
              >
                <Icon
                  name="pill.fill"
                  fallback="medkit"
                  size={24}
                  color={medication.color}
                />
              </View>

              {/* Info */}
              <View className="flex-1 min-w-0">
                <View className="flex-row items-center gap-2">
                  <Typography
                    variant="h3"
                    className="text-surface-900 font-semibold flex-1"
                    numberOfLines={1}
                  >
                    {title}
                  </Typography>
                  <Icon
                    name={isExpanded ? 'chevron.up' : 'chevron.down'}
                    fallback={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#A3A3A3"
                  />
                </View>

                <Typography variant="small" className="text-surface-500 mt-0.5">
                  {subtitle || 'No dosage'}
                </Typography>

                <View className="flex-row items-center gap-2 mt-2 flex-wrap">
                  <View className="px-2 py-1 bg-primary-50 rounded-full">
                    <Typography variant="small" className="text-primary-600">
                      {MEAL_LABELS[medication.mealTiming]}
                    </Typography>
                  </View>
                  <View className="px-2 py-1 bg-surface-100 rounded-full">
                    <Typography variant="small" className="text-surface-600">
                      {SCHEDULE_LABELS[medication.scheduleType]}
                    </Typography>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Expanded content */}
          {isExpanded && (
            <View className="px-5 pb-5 pt-0 border-t border-surface-100 mt-0">
              <View className="pt-4 gap-4">
                {/* Basic fields */}
                <Input
                  label="Name"
                  value={medication.name}
                  onChangeText={(t) => onUpdateField('name', t)}
                  placeholder="e.g., Domperidone"
                  size="lg"
                />

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Input
                      label="Dosage"
                      value={medication.dosage}
                      onChangeText={(t) => onUpdateField('dosage', t)}
                      placeholder="10"
                      size="lg"
                    />
                  </View>
                  <View className="w-36">
                    <Input
                      label="Unit"
                      value={medication.dosageUnit}
                      onChangeText={(t) => onUpdateField('dosageUnit', t)}
                      placeholder="tablet"
                      size="lg"
                    />
                  </View>
                </View>

                {/* Instructions */}
                <Input
                  label="Instructions"
                  value={medication.instructions}
                  onChangeText={(t) => onUpdateField('instructions', t)}
                  placeholder="Before meal, for 2 weeks..."
                  multiline
                  size="lg"
                  style={{ minHeight: 80, textAlignVertical: 'top' } as any}
                />

                {/* Action buttons */}
                <View className="flex-row gap-3 pt-2">
                  <Button
                    title="Remove"
                    variant="danger"
                    className="flex-1"
                    onPress={onRemove}
                    size="md"
                  />
                </View>
              </View>
            </View>
          )}
        </Animated.View>
      </Card>
    </Animated.View>
  );
}

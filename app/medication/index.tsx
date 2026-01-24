import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useMedicationForm } from '../../src/contexts/MedicationFormContext';
import { Screen } from '../../src/components/layout/Screen';
import { Typography } from '../../src/components/ui/Typography';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';

const DOSAGE_UNITS = [
  { label: 'tablet', icon: 'ellipse' },
  { label: 'capsule', icon: 'ellipse-outline' },
  { label: 'mg', icon: 'flask-outline' },
  { label: 'mL', icon: 'water-outline' },
  { label: 'drop', icon: 'water' },
  { label: 'puff', icon: 'cloud-outline' },
];

const MEDICATION_COLORS = [
  '#06B6D4',
  '#F97316',
  '#8B5CF6',
  '#22C55E',
  '#EF4444',
  '#EC4899',
  '#F59E0B',
  '#6366F1',
];

export default function AddMedicationStep1() {
  const insets = useSafeAreaInsets();
  const { formData, updateFormData, isEditing } = useMedicationForm();

  const canProceed = formData.name.trim().length > 0 && formData.dosage.trim().length > 0;

  return (
    <View className="flex-1 bg-surface-50">
      <ProgressBar current={1} total={5} />

      <Screen
        scroll
        keyboardAvoiding
        includeTopInset={false}
        padX={16}
        padY={16}
        padBottomExtra={140}
      >
        <Typography variant="h2" className="text-surface-900 mb-1">
          {isEditing ? 'Edit medication' : 'Add medication'}
        </Typography>
        <Typography variant="body" className="text-surface-500 mb-6">
          Step 1 of 5 · Basics
        </Typography>

        <View className="bg-white rounded-3xl border border-surface-100 p-5">
          {/* Name */}
          <View className="mb-5">
            <Typography variant="label" className="text-surface-600 mb-2 uppercase tracking-wider text-xs">
              Medication name
            </Typography>
            <Input
              value={formData.name}
              onChangeText={(text) => updateFormData({ name: text })}
              placeholder="e.g., Metformin"
              autoCapitalize="words"
              autoFocus
              size="lg"
            />
          </View>

          {/* Dosage */}
          <View className="mb-5">
            <Typography variant="label" className="text-surface-600 mb-2 uppercase tracking-wider text-xs">
              Dosage
            </Typography>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Input
                  value={formData.dosage}
                  onChangeText={(text) => updateFormData({ dosage: text })}
                  placeholder="e.g., 500"
                  keyboardType="numeric"
                  size="lg"
                />
              </View>
              <View className="flex-1">
                <Input
                  value={formData.dosageUnit}
                  onChangeText={(text) => updateFormData({ dosageUnit: text })}
                  placeholder="Unit"
                  size="lg"
                />
              </View>
            </View>

            <View className="flex-row flex-wrap gap-2 mt-3">
              {DOSAGE_UNITS.map((unit) => {
                const selected = formData.dosageUnit === unit.label;
                return (
                  <Pressable
                    key={unit.label}
                    onPress={() => updateFormData({ dosageUnit: unit.label })}
                    className={`px-3 py-2 rounded-xl flex-row items-center ${selected ? 'bg-primary-100' : 'bg-surface-100'}`}
                  >
                    <Ionicons name={unit.icon as any} size={14} color={selected ? '#06B6D4' : '#737373'} />
                    <Typography variant="small" className={`ml-1.5 font-medium ${selected ? 'text-primary-700' : 'text-surface-600'}`}>
                      {unit.label}
                    </Typography>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Instructions */}
          <View className="mb-5">
            <Typography variant="label" className="text-surface-600 mb-2 uppercase tracking-wider text-xs">
              Instructions <Typography variant="small" className="text-surface-400 normal-case">(optional)</Typography>
            </Typography>
            <Input
              value={formData.instructions}
              onChangeText={(text) => updateFormData({ instructions: text })}
              placeholder="e.g., Take with a full glass of water"
              multiline
              numberOfLines={2}
              size="lg"
            />
          </View>

          {/* Color */}
          <View>
            <Typography variant="label" className="text-surface-600 mb-2 uppercase tracking-wider text-xs">
              Color tag
            </Typography>
            <View className="flex-row flex-wrap gap-3">
              {MEDICATION_COLORS.map((color) => {
                const selected = formData.color === color;
                return (
                  <Pressable
                    key={color}
                    onPress={() => updateFormData({ color })}
                    className={`w-10 h-10 rounded-2xl items-center justify-center ${selected ? 'border-2 border-surface-900' : ''}`}
                    style={{ backgroundColor: color }}
                  >
                    {selected ? <Ionicons name="checkmark" size={18} color="#fff" /> : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Screen>

      {/* Footer */}
      <View className="px-6 pt-4 bg-white border-t border-surface-100" style={{ paddingBottom: insets.bottom + 16 }}>
        <Button
          title="Next: Schedule"
          onPress={() => router.push('/medication/schedule')}
          disabled={!canProceed}
          size="lg"
          fullWidth
        />
      </View>
    </View>
  );
}

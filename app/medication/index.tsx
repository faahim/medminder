import { View, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useMedicationForm } from '../../src/contexts/MedicationFormContext';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Typography } from '../../src/components/ui/Typography';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Ionicons } from '@expo/vector-icons';

const DOSAGE_UNITS = [
  { label: 'tablet', icon: 'ellipse' },
  { label: 'capsule', icon: 'ellipse-outline' },
  { label: 'mg', icon: 'flask-outline' },
  { label: 'mL', icon: 'water-outline' },
  { label: 'drop', icon: 'water' },
  { label: 'puff', icon: 'cloud-outline' },
];

const MEDICATION_COLORS = [
  '#06B6D4', // Primary cyan
  '#F97316', // Orange
  '#8B5CF6', // Violet
  '#22C55E', // Green
  '#EF4444', // Red
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#6366F1', // Indigo
];

export default function AddMedicationStep1() {
  const { formData, updateFormData, isEditing } = useMedicationForm();

  const canProceed = formData.name.trim().length > 0 && formData.dosage.trim().length > 0;

  const handleNext = () => {
    router.push('/medication/schedule');
  };

  return (
    <ScreenWrapper>
      <ProgressBar current={1} total={5} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6 py-6">
          <Typography variant="h2" className="text-surface-900 dark:text-white mb-1">
            {isEditing ? 'Edit Medication' : 'Add Medication'}
          </Typography>
          <Typography variant="body" className="text-surface-500 dark:text-surface-400 mb-6">
            Step 1 of 5: What medication is this?
          </Typography>

          {/* Medication Name */}
          <View className="mb-6">
            <Typography variant="label" className="text-surface-600 dark:text-surface-400 mb-3 uppercase tracking-wider text-xs">
              Medication Name
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
          <View className="mb-6">
            <Typography variant="label" className="text-surface-600 dark:text-surface-400 mb-3 uppercase tracking-wider text-xs">
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

            {/* Quick Unit Selection */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-3 -mx-1"
              contentContainerStyle={{ paddingHorizontal: 4 }}
            >
              {DOSAGE_UNITS.map((unit) => (
                <Pressable
                  key={unit.label}
                  onPress={() => updateFormData({ dosageUnit: unit.label })}
                  className={`px-3 py-2 rounded-lg mr-2 flex-row items-center ${
                    formData.dosageUnit === unit.label
                      ? 'bg-primary-100 dark:bg-primary-900'
                      : 'bg-surface-100 dark:bg-surface-800'
                  }`}
                >
                  <Ionicons
                    name={unit.icon as any}
                    size={14}
                    color={formData.dosageUnit === unit.label ? '#06B6D4' : '#737373'}
                  />
                  <Typography
                    variant="small"
                    className={`ml-1.5 font-medium ${
                      formData.dosageUnit === unit.label
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-surface-600 dark:text-surface-400'
                    }`}
                  >
                    {unit.label}
                  </Typography>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Instructions (optional) */}
          <View className="mb-6">
            <Typography variant="label" className="text-surface-600 dark:text-surface-400 mb-3 uppercase tracking-wider text-xs">
              Special Instructions
              <Typography variant="small" className="text-surface-400 dark:text-surface-500 normal-case tracking-normal">
                {' '}(optional)
              </Typography>
            </Typography>
            <Input
              value={formData.instructions}
              onChangeText={(text) => updateFormData({ instructions: text })}
              placeholder="e.g., Take with full glass of water"
              multiline
              numberOfLines={2}
              size="lg"
            />
          </View>

          {/* Color Selection */}
          <View className="mb-6">
            <Typography variant="label" className="text-surface-600 dark:text-surface-400 mb-3 uppercase tracking-wider text-xs">
              Color Tag
            </Typography>
            <View className="flex-row flex-wrap gap-3">
              {MEDICATION_COLORS.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => updateFormData({ color })}
                  className={`w-10 h-10 rounded-xl items-center justify-center ${
                    formData.color === color ? 'border-2 border-surface-900 dark:border-white' : ''
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {formData.color === color && (
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="px-6 pb-8 pt-4 bg-white dark:bg-surface-900 border-t border-surface-100 dark:border-surface-800">
          <Button
            title="Next: Set Schedule"
            onPress={handleNext}
            disabled={!canProceed}
            size="lg"
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

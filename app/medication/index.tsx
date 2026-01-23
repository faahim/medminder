import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useMedicationForm } from '../../src/contexts/MedicationFormContext';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Typography } from '../../src/components/ui/Typography';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';

const DOSAGE_UNITS = [
  { label: 'Tablet(s)', value: 'tablet' },
  { label: 'Capsule(s)', value: 'capsule' },
  { label: 'mL', value: 'ml' },
  { label: 'mg', value: 'mg' },
  { label: 'Drop(s)', value: 'drop' },
  { label: 'Puff(s)', value: 'puff' },
];

export default function AddMedicationStep1() {
  const { formData, updateFormData, isEditing } = useMedicationForm();

  const canProceed = formData.name.trim().length > 0 && formData.dosage.trim().length > 0;

  const handleNext = () => {
    router.push('/medication/schedule');
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Progress */}
        <ProgressBar current={1} total={5} />

        {/* Content */}
        <View className="flex-1 px-6 py-8">
          <Typography variant="h2" className="text-gray-900 dark:text-white mb-2">
            {isEditing ? 'Edit Medication' : 'Add Medication'}
          </Typography>
          <Typography variant="body" className="text-gray-500 dark:text-gray-400 mb-8">
            Step 1 of 5: What medication is this?
          </Typography>

          {/* Medication Name */}
          <View className="mb-6">
            <Typography variant="label" className="text-gray-700 dark:text-gray-300 mb-2">
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
            <Typography variant="label" className="text-gray-700 dark:text-gray-300 mb-2">
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
            <Typography variant="small" className="text-gray-500 dark:text-gray-400 mt-2">
              Common units: tablet, capsule, mg, mL
            </Typography>
          </View>

          {/* Instructions (optional) */}
          <View className="mb-6">
            <Typography variant="label" className="text-gray-700 dark:text-gray-300 mb-2">
              Special Instructions (optional)
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
        </View>

        {/* Footer */}
        <View className="px-6 pb-8">
          <Button
            title="Next: Set Schedule"
            onPress={handleNext}
            disabled={!canProceed}
            size="xl"
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

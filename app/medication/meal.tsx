import { View, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useMedicationForm } from '../../src/contexts/MedicationFormContext';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Ionicons } from '@expo/vector-icons';
import { MealTiming } from '../../src/types';

const MEAL_OPTIONS: { value: MealTiming; label: string; description: string; icon: keyof typeof Ionicons.glyphMap; color: string; bgColor: string }[] = [
  {
    value: 'before',
    label: 'Before Meal',
    description: 'Take 30-60 minutes before eating',
    icon: 'timer-outline',
    color: '#0891B2', // primary-600
    bgColor: 'bg-primary-50 dark:bg-primary-950',
  },
  {
    value: 'after',
    label: 'After Meal',
    description: 'Take within 30 minutes after eating',
    icon: 'checkmark-circle-outline',
    color: '#F97316', // accent-500
    bgColor: 'bg-accent-50 dark:bg-accent-950',
  },
  {
    value: 'with',
    label: 'With Food',
    description: 'Take during your meal',
    icon: 'restaurant-outline',
    color: '#8B5CF6', // violet-500
    bgColor: 'bg-violet-50 dark:bg-violet-950',
  },
  {
    value: 'anytime',
    label: 'Anytime',
    description: 'No specific meal timing required',
    icon: 'ellipse-outline',
    color: '#737373', // surface-500
    bgColor: 'bg-surface-100 dark:bg-surface-800',
  },
];

export default function AddMedicationStep3() {
  const { formData, updateFormData } = useMedicationForm();

  return (
    <ScreenWrapper>
      <ProgressBar current={3} total={5} />

      <ScrollView className="flex-1 px-6 py-6">
        <Typography variant="h2" className="text-surface-900 dark:text-white mb-1">
          Meal timing
        </Typography>
        <Typography variant="body" className="text-surface-500 dark:text-surface-400 mb-6">
          Step 3 of 5: When should you take it relative to meals?
        </Typography>

        <View className="gap-3">
          {MEAL_OPTIONS.map((option) => {
            const isSelected = formData.mealTiming === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => updateFormData({ mealTiming: option.value })}
                className={`flex-row items-center p-4 rounded-2xl border-2 ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                    : 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800'
                }`}
              >
                <View
                  className={`w-14 h-14 rounded-xl items-center justify-center mr-4 ${option.bgColor}`}
                >
                  <Ionicons name={option.icon} size={28} color={option.color} />
                </View>
                <View className="flex-1">
                  <Typography
                    variant="body"
                    className={`font-semibold ${
                      isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-surface-900 dark:text-white'
                    }`}
                  >
                    {option.label}
                  </Typography>
                  <Typography variant="small" className="text-surface-500 dark:text-surface-400">
                    {option.description}
                  </Typography>
                </View>
                {isSelected && (
                  <View className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center">
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
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
            title="Next"
            size="lg"
            onPress={() => router.push('/medication/duration')}
            className="flex-1"
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

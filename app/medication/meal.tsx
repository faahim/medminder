import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useMedicationForm } from '../../src/contexts/MedicationFormContext';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Ionicons } from '@expo/vector-icons';
import { MealTiming } from '../../src/types';

const MEAL_OPTIONS: { value: MealTiming; label: string; description: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  {
    value: 'before',
    label: 'Before Meal',
    description: 'Take 30-60 minutes before eating',
    icon: 'restaurant-outline',
    color: '#2196F3', // Blue
  },
  {
    value: 'after',
    label: 'After Meal',
    description: 'Take within 30 minutes after eating',
    icon: 'fast-food-outline',
    color: '#FF9800', // Orange
  },
  {
    value: 'with',
    label: 'With Food',
    description: 'Take during your meal',
    icon: 'nutrition-outline',
    color: '#9C27B0', // Purple
  },
  {
    value: 'anytime',
    label: 'Anytime',
    description: 'No specific meal timing required',
    icon: 'time-outline',
    color: '#607D8B', // Gray
  },
];

export default function AddMedicationStep3() {
  const { formData, updateFormData } = useMedicationForm();

  return (
    <ScreenWrapper>
      <ProgressBar current={3} total={5} />

      <View className="flex-1 px-6 py-8">
        <Typography variant="h2" className="text-gray-900 dark:text-white mb-2">
          Meal timing
        </Typography>
        <Typography variant="body" className="text-gray-500 dark:text-gray-400 mb-8">
          Step 3 of 5: When should you take it relative to meals?
        </Typography>

        <View className="gap-4">
          {MEAL_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => updateFormData({ mealTiming: option.value })}
              className={`flex-row items-center p-5 rounded-2xl ${
                formData.mealTiming === option.value
                  ? 'bg-green-50 dark:bg-green-900 border-2 border-green-500'
                  : 'bg-gray-100 dark:bg-gray-800 border-2 border-transparent'
              }`}
            >
              <View
                className="w-14 h-14 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: option.color + '20' }}
              >
                <Ionicons name={option.icon} size={28} color={option.color} />
              </View>
              <View className="flex-1">
                <Typography variant="h3" className="text-gray-900 dark:text-white">
                  {option.label}
                </Typography>
                <Typography variant="small" className="text-gray-500 dark:text-gray-400">
                  {option.description}
                </Typography>
              </View>
              {formData.mealTiming === option.value && (
                <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
              )}
            </Pressable>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View className="px-6 pb-8 flex-row gap-3">
        <Button
          title="Back"
          variant="outline"
          size="xl"
          onPress={() => router.back()}
          className="flex-1"
        />
        <Button
          title="Next"
          size="xl"
          onPress={() => router.push('/medication/duration')}
          className="flex-1"
        />
      </View>
    </ScreenWrapper>
  );
}

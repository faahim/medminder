import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMedicationForm } from '../../src/contexts/MedicationFormContext';
import { Screen } from '../../src/components/layout/Screen';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Icon } from '../../src/components/ui/Icon';
import { MealTiming } from '../../src/types';

const MEAL_OPTIONS: {
  value: MealTiming;
  label: string;
  description: string;
  sfSymbol: string;
  fallbackIcon: string;
  color: string;
  bg: string;
}[] = [
  { value: 'before', label: 'Before meal', description: '30–60 minutes before eating', sfSymbol: 'clock', fallbackIcon: 'time', color: '#0891B2', bg: 'bg-primary-50' },
  { value: 'after', label: 'After meal', description: 'Within 30 minutes after eating', sfSymbol: 'checkmark.circle', fallbackIcon: 'check-circle', color: '#F97316', bg: 'bg-accent-50' },
  { value: 'with', label: 'With food', description: 'During your meal', sfSymbol: 'fork.knife', fallbackIcon: 'restaurant', color: '#8B5CF6', bg: 'bg-surface-100' },
  { value: 'anytime', label: 'Anytime', description: 'No meal timing needed', sfSymbol: 'circle', fallbackIcon: 'circle', color: '#737373', bg: 'bg-surface-100' },
];

export default function AddMedicationStep3() {
  const insets = useSafeAreaInsets();
  const { formData, updateFormData } = useMedicationForm();

  return (
    <View className="flex-1 bg-surface-50">
      <ProgressBar current={3} total={5} />

      <Screen scroll includeTopInset={false} padX={16} padY={16} padBottomExtra={160}>
        <Typography variant="h2" className="text-surface-900 mb-1">
          Meal timing
        </Typography>
        <Typography variant="body" className="text-surface-500 mb-6">
          Step 3 of 5 · Optional guidance
        </Typography>

        <View className="bg-white rounded-3xl border border-surface-100 p-5">
          <View className="gap-3">
            {MEAL_OPTIONS.map((option) => {
              const selected = formData.mealTiming === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => updateFormData({ mealTiming: option.value })}
                  className={`flex-row items-center p-4 rounded-2xl border ${selected ? 'border-primary-500 bg-primary-50' : 'border-surface-100 bg-white'}`}
                >
                  <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${option.bg}`}>
                    <Icon name={option.sfSymbol} fallback={option.fallbackIcon} size={26} color={option.color} />
                  </View>
                  <View className="flex-1">
                    <Typography variant="body" className={`font-semibold ${selected ? 'text-primary-700' : 'text-surface-900'}`}>
                      {option.label}
                    </Typography>
                    <Typography variant="small" className="text-surface-500">
                      {option.description}
                    </Typography>
                  </View>
                  {selected ? (
                    <View className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center">
                      <Icon name="checkmark" fallback="check" size={16} color="#fff" />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Screen>

      <View className="px-6 pt-4 bg-white border-t border-surface-100" style={{ paddingBottom: insets.bottom + 16 }}>
        <View className="flex-row gap-3">
          <Button title="Back" variant="secondary" size="lg" onPress={() => router.back()} className="flex-1" />
          <Button title="Next" size="lg" onPress={() => router.push('/medication/duration')} className="flex-1" />
        </View>
      </View>
    </View>
  );
}

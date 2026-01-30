import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useMedicationForm } from '../../src/contexts/MedicationFormContext';
import { Screen } from '../../src/components/layout/Screen';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Icon } from '../../src/components/ui/Icon';
import { Input } from '../../src/components/ui/Input';

const SUPPLY_UNITS = [
  { label: 'pills', icon: 'circle.dashed', fallbackIcon: 'radio-button-off' },
  { label: 'ml', icon: 'drop', fallbackIcon: 'water' },
  { label: 'doses', icon: 'sparkles', fallbackIcon: 'flask' },
];

const THRESHOLD_OPTIONS = [
  { value: 3, label: '3 days', description: 'Get alerted early' },
  { value: 5, label: '5 days', description: 'Standard alert' },
  { value: 7, label: '7 days', description: 'Give me more time' },
  { value: 10, label: '10 days', description: 'Conservative' },
];

export default function AddMedicationStep6() {
  const insets = useSafeAreaInsets();
  const { formData, updateFormData } = useMedicationForm();

  const isRefillEnabled = formData.currentSupply > 0;

  const handleToggleRefill = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isRefillEnabled) {
      updateFormData({ currentSupply: 0, supplyUnit: 'pills', lowSupplyThreshold: 7 });
    } else {
      updateFormData({ currentSupply: 30, supplyUnit: 'pills', lowSupplyThreshold: 7 });
    }
  };

  const canProceed = !isRefillEnabled || (formData.currentSupply > 0 && formData.supplyUnit);

  return (
    <View className="flex-1 bg-surface-50">
      <ProgressBar current={6} total={6} />

      <Screen scroll includeTopInset={false} padX={16} padY={16} padBottomExtra={170}>
        <Typography variant="h2" className="text-surface-900 mb-1">
          Refill settings
        </Typography>
        <Typography variant="body" className="text-surface-500 mb-6">
          Step 6 of 6 · Track your supply
        </Typography>

        {/* Toggle Card */}
        <View className="bg-white rounded-3xl border border-surface-100 p-5 mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Typography variant="body" className="text-surface-900 font-semibold mb-1">
                Track medication supply
              </Typography>
              <Typography variant="small" className="text-surface-500">
                Get reminders when you're running low
              </Typography>
            </View>
            <Pressable
              onPress={handleToggleRefill}
              className={`w-14 h-8 rounded-full ${isRefillEnabled ? 'bg-primary-500' : 'bg-surface-200'}`}
              style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.96 : 1 }] })}
            >
              <View
                className={`w-6 h-6 rounded-full bg-white shadow-md ${isRefillEnabled ? 'ml-auto mr-1' : 'ml-1'}`}
                style={{ marginTop: 2 }}
              />
            </Pressable>
          </View>
        </View>

        {isRefillEnabled ? (
          <>
            {/* Current Supply Card */}
            <View className="bg-white rounded-3xl border border-surface-100 p-5 mb-4">
              <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 rounded-xl bg-primary-50 items-center justify-center mr-3">
                  <Icon name="cube.box" fallback="cube" size={18} color="#06B6D4" />
                </View>
                <Typography variant="label" className="text-surface-600 uppercase tracking-wider text-xs">
                  Current supply
                </Typography>
              </View>

              <View className="flex-row items-center gap-3">
                <View className="flex-1">
                  <Input
                    value={String(formData.currentSupply)}
                    onChangeText={(text) => updateFormData({ currentSupply: parseInt(text) || 0 })}
                    placeholder="30"
                    keyboardType="number-pad"
                    size="lg"
                  />
                </View>
                <View className="flex-row gap-2 flex-wrap">
                  {SUPPLY_UNITS.map((unit) => {
                    const selected = formData.supplyUnit === unit.label;
                    return (
                      <Pressable
                        key={unit.label}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          updateFormData({ supplyUnit: unit.label });
                        }}
                        className={`flex-row items-center px-3 py-2 rounded-xl ${selected ? 'bg-primary-100 border border-primary-200' : 'bg-surface-100'}`}
                      >
                        <Icon name={unit.icon} fallback={unit.fallbackIcon} size={14} color={selected ? '#06B6D4' : '#737373'} />
                        <Typography variant="small" className={`ml-1.5 ${selected ? 'text-primary-700' : 'text-surface-600'}`}>
                          {unit.label}
                        </Typography>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="mt-3 bg-surface-50 rounded-xl p-3">
                <Typography variant="small" className="text-surface-600">
                  This represents how much medication you currently have on hand.
                </Typography>
              </View>
            </View>

            {/* Alert Threshold Card */}
            <View className="bg-white rounded-3xl border border-surface-100 p-5 mb-4">
              <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 rounded-xl bg-warning-50 items-center justify-center mr-3">
                  <Icon name="bell.badge" fallback="notifications" size={18} color="#F97316" />
                </View>
                <Typography variant="label" className="text-surface-600 uppercase tracking-wider text-xs">
                  Alert me when
                </Typography>
              </View>

              <Typography variant="body" className="text-surface-700 mb-3">
                I have this many days of supply remaining:
              </Typography>

              <View className="gap-2">
                {THRESHOLD_OPTIONS.map((option) => {
                  const selected = formData.lowSupplyThreshold === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        updateFormData({ lowSupplyThreshold: option.value });
                      }}
                      className={`flex-row items-center p-4 rounded-2xl ${selected ? 'bg-warning-50 border border-warning-200' : 'bg-surface-100'}`}
                    >
                      <View className={`w-9 h-9 rounded-xl items-center justify-center mr-3 ${selected ? 'bg-warning-500' : 'bg-white'}`}>
                        <Typography variant="body" className={`font-bold ${selected ? 'text-white' : 'text-surface-700'}`}>
                          {option.value}
                        </Typography>
                      </View>
                      <View className="flex-1">
                        <Typography variant="body" className={`font-medium ${selected ? 'text-warning-800' : 'text-surface-900'}`}>
                          {option.label}
                        </Typography>
                        <Typography variant="small" className="text-surface-500">
                          {option.description}
                        </Typography>
                      </View>
                      {selected ? (
                        <View className="w-6 h-6 rounded-full bg-warning-500 items-center justify-center">
                          <Icon name="checkmark" fallback="check" size={14} color="#fff" />
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Info Card */}
            <View className="bg-primary-50 rounded-2xl p-4 border border-primary-100">
              <View className="flex-row items-start">
                <View className="w-10 h-10 rounded-xl bg-primary-100 items-center justify-center mr-3">
                  <Icon name="info.circle" fallback="info" size={20} color="#06B6D4" />
                </View>
                <View className="flex-1">
                  <Typography variant="body" className="text-surface-900 font-semibold mb-1">
                    How it works
                  </Typography>
                  <Typography variant="small" className="text-surface-700">
                    Based on your dosage schedule, we'll calculate how many days of medication you have left and remind you when it's time to refill.
                  </Typography>
                </View>
              </View>
            </View>
          </>
        ) : (
          <View className="bg-surface-100 rounded-3xl p-6 items-center">
            <View className="w-16 h-16 rounded-full bg-surface-200 items-center justify-center mb-4">
              <Icon name="slash.circle" fallback="close-circle" size={32} color="#9CA3AF" />
            </View>
            <Typography variant="body" className="text-surface-600 text-center mb-2">
              Refill tracking disabled
            </Typography>
            <Typography variant="small" className="text-surface-500 text-center">
              You can always enable this later from the medication detail screen.
            </Typography>
          </View>
        )}
      </Screen>

      <View className="px-6 pt-4 bg-white border-t border-surface-100" style={{ paddingBottom: insets.bottom + 16 }}>
        <View className="flex-row gap-3">
          <Button title="Back" variant="secondary" size="lg" onPress={() => router.back()} className="flex-1" />
          <Button title="Review" size="lg" onPress={() => router.push('/medication/confirm')} disabled={!canProceed} className="flex-1" />
        </View>
      </View>
    </View>
  );
}

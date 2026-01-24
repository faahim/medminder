import { View, Pressable } from 'react-native';
import { Typography } from './Typography';
import * as Haptics from 'expo-haptics';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  disabled?: boolean;
}

export function SegmentedControl({ options, selectedIndex, onChange, disabled = false }: SegmentedControlProps) {
  const handleSelect = (index: number) => {
    if (!disabled && index !== selectedIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(index);
    }
  };

  return (
    <View className="flex-row bg-surface-100 rounded-2xl p-1" accessibilityRole="tablist">
      {options.map((option, index) => {
        const selected = index === selectedIndex;
        return (
          <Pressable
            key={option}
            onPress={() => handleSelect(index)}
            disabled={disabled}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option}
            className={`flex-1 py-3 px-4 rounded-xl items-center justify-center ${selected ? 'bg-white shadow-sm' : 'bg-transparent'} ${disabled ? 'opacity-50' : ''}`}
          >
            <Typography variant="body" className={`font-semibold ${selected ? 'text-primary-600' : 'text-surface-600'}`}>
              {option}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
}

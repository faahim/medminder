import { View, Pressable } from 'react-native';
import { Typography } from './Typography';
import * as Haptics from 'expo-haptics';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  disabled?: boolean;
}

export function SegmentedControl({
  options,
  selectedIndex,
  onChange,
  disabled = false,
}: SegmentedControlProps) {
  const handleSelect = (index: number) => {
    if (!disabled && index !== selectedIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(index);
    }
  };

  return (
    <View 
      className="flex-row bg-gray-200 dark:bg-gray-700 rounded-xl p-1"
      accessibilityRole="tablist"
    >
      {options.map((option, index) => (
        <Pressable
          key={option}
          onPress={() => handleSelect(index)}
          disabled={disabled}
          accessibilityRole="tab"
          accessibilityState={{ selected: index === selectedIndex }}
          accessibilityLabel={option}
          className={`
            flex-1 py-3 px-4 rounded-lg items-center justify-center
            ${index === selectedIndex 
              ? 'bg-white dark:bg-gray-600 shadow-sm' 
              : 'bg-transparent'
            }
            ${disabled ? 'opacity-50' : ''}
          `}
        >
          <Typography
            variant="body"
            className={`
              font-semibold
              ${index === selectedIndex 
                ? 'text-primary-600 dark:text-primary-400' 
                : 'text-gray-600 dark:text-gray-400'
              }
            `}
          >
            {option}
          </Typography>
        </Pressable>
      ))}
    </View>
  );
}

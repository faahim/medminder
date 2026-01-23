import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui/Typography';
import { MealTiming } from '../../types';

interface MealTimingBadgeProps {
  timing: MealTiming;
  size?: 'sm' | 'md' | 'lg';
}

const timingConfig: Record<MealTiming, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  before: { label: 'Before meal', color: '#2196F3', icon: 'restaurant-outline' },
  after: { label: 'After meal', color: '#FF9800', icon: 'fast-food-outline' },
  with: { label: 'With food', color: '#9C27B0', icon: 'nutrition-outline' },
  anytime: { label: 'Anytime', color: '#607D8B', icon: 'time-outline' },
};

const sizeConfig = {
  sm: { container: 'px-2 py-1', text: 'text-xs', icon: 12 },
  md: { container: 'px-3 py-1.5', text: 'text-sm', icon: 14 },
  lg: { container: 'px-4 py-2', text: 'text-base', icon: 18 },
};

export function MealTimingBadge({ timing, size = 'md' }: MealTimingBadgeProps) {
  const config = timingConfig[timing];
  const sizes = sizeConfig[size];

  return (
    <View
      className={`flex-row items-center rounded-full ${sizes.container}`}
      style={{ backgroundColor: config.color + '20' }}
    >
      <Ionicons name={config.icon} size={sizes.icon} color={config.color} />
      <Typography
        variant="small"
        className={`ml-1 font-medium ${sizes.text}`}
        style={{ color: config.color }}
      >
        {config.label}
      </Typography>
    </View>
  );
}

import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui/Typography';
import { MealTiming } from '../../types';

interface MealTimingBadgeProps {
  timing: MealTiming;
  size?: 'sm' | 'md' | 'lg';
}

const timingConfig: Record<MealTiming, { label: string; color: string; bgColor: string; icon: keyof typeof Ionicons.glyphMap }> = {
  before: {
    label: 'Before meal',
    color: '#0891B2', // primary-600
    bgColor: 'rgba(8, 145, 178, 0.1)',
    icon: 'timer-outline'
  },
  after: {
    label: 'After meal',
    color: '#F97316', // accent-500
    bgColor: 'rgba(249, 115, 22, 0.1)',
    icon: 'checkmark-circle-outline'
  },
  with: {
    label: 'With food',
    color: '#8B5CF6', // violet-500
    bgColor: 'rgba(139, 92, 246, 0.1)',
    icon: 'restaurant-outline'
  },
  anytime: {
    label: 'Anytime',
    color: '#737373', // surface-500
    bgColor: 'rgba(115, 115, 115, 0.1)',
    icon: 'ellipse-outline'
  },
};

const sizeConfig = {
  sm: { container: 'px-2 py-0.5', text: 'text-xs', icon: 11 },
  md: { container: 'px-2.5 py-1', text: 'text-xs', icon: 13 },
  lg: { container: 'px-3 py-1.5', text: 'text-sm', icon: 16 },
};

export function MealTimingBadge({ timing, size = 'sm' }: MealTimingBadgeProps) {
  const config = timingConfig[timing];
  const sizes = sizeConfig[size];

  return (
    <View
      className={`flex-row items-center rounded-full self-start ${sizes.container}`}
      style={{ backgroundColor: config.bgColor }}
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

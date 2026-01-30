import { Badge } from '../ui/Badge';
import { Icon } from '../ui/Icon';
import type { MealTiming } from '../../types';
import { colors } from '../../design';

interface MealTimingBadgeProps {
  timing: MealTiming;
  size?: 'sm' | 'md' | 'lg';
}

export function MealTimingBadge({ timing, size = 'sm' }: MealTimingBadgeProps) {
  const badgeSize = size === 'lg' ? 'md' : size;
  const iconSize = size === 'lg' ? 16 : size === 'md' ? 14 : 12;

  switch (timing) {
    case 'before':
      return (
        <Badge
          size={badgeSize}
          variant="primary"
          label="Before meal"
          left={<Icon name="timer" fallback="timer-outline" size={iconSize} color={colors.primary[700]} />}
        />
      );
    case 'after':
      return (
        <Badge
          size={badgeSize}
          variant="warning"
          label="After meal"
          left={<Icon name="checkmark.circle" fallback="checkmark-circle-outline" size={iconSize} color={colors.warning[600]} />}
        />
      );
    case 'with':
      return (
        <Badge
          size={badgeSize}
          variant="success"
          label="With food"
          left={<Icon name="fork.knife" fallback="restaurant-outline" size={iconSize} color={colors.success[700]} />}
        />
      );
    case 'anytime':
    default:
      return (
        <Badge
          size={badgeSize}
          variant="default"
          label="Anytime"
          left={<Icon name="circle" fallback="ellipse-outline" size={iconSize} color={colors.surface[700]} />}
        />
      );
  }
}

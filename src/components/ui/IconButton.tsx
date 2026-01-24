import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  accessibilityLabel: string;
}

const sizeMap: Record<IconButtonSize, { container: string; icon: number }> = {
  sm: { container: 'w-10 h-10', icon: 20 },
  md: { container: 'w-12 h-12', icon: 24 },
  lg: { container: 'w-14 h-14', icon: 28 },
};

const colorMap: Record<IconButtonVariant, { bg: string; icon: string }> = {
  primary: { bg: 'bg-primary-500 active:bg-primary-600', icon: '#FFFFFF' },
  secondary: { bg: 'bg-surface-100 active:bg-surface-200', icon: '#0A0A0A' },
  ghost: { bg: 'bg-transparent active:bg-surface-100', icon: '#06B6D4' },
  danger: { bg: 'bg-danger-500 active:bg-danger-600', icon: '#FFFFFF' },
};

export function IconButton({
  icon,
  onPress,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  accessibilityLabel,
}: IconButtonProps) {
  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const sizes = sizeMap[size];
  const colors = colorMap[variant];

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className={`
        ${sizes.container}
        ${colors.bg}
        rounded-full items-center justify-center
        ${disabled ? 'opacity-50' : ''}
      `}
    >
      <Ionicons name={icon} size={sizes.icon} color={colors.icon} />
    </Pressable>
  );
}

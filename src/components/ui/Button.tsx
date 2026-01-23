import { Pressable, View, ActivityIndicator } from 'react-native';
import { Typography } from './Typography';
import * as Haptics from 'expo-haptics';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  accessibilityLabel?: string;
}

const variantStyles: Record<ButtonVariant, { container: string; text: string; spinner: string }> = {
  primary: {
    container: 'bg-primary-500 active:bg-primary-600',
    text: 'text-white',
    spinner: '#fff',
  },
  secondary: {
    container: 'bg-surface-100 dark:bg-surface-800 active:bg-surface-200 dark:active:bg-surface-700',
    text: 'text-surface-900 dark:text-white',
    spinner: '#171717',
  },
  outline: {
    container: 'bg-transparent border-2 border-primary-500 active:bg-primary-50 dark:active:bg-primary-950',
    text: 'text-primary-600 dark:text-primary-400',
    spinner: '#06B6D4',
  },
  ghost: {
    container: 'bg-transparent active:bg-surface-100 dark:active:bg-surface-800',
    text: 'text-primary-600 dark:text-primary-400',
    spinner: '#06B6D4',
  },
  danger: {
    container: 'bg-danger-500 active:bg-danger-600',
    text: 'text-white',
    spinner: '#fff',
  },
  success: {
    container: 'bg-success-500 active:bg-success-600',
    text: 'text-white',
    spinner: '#fff',
  },
};

const sizeStyles: Record<ButtonSize, { container: string; text: string }> = {
  sm: { container: 'px-4 py-2.5 rounded-xl', text: 'text-sm' },
  md: { container: 'px-5 py-3.5 rounded-xl', text: 'text-base' },
  lg: { container: 'px-6 py-4 rounded-2xl', text: 'text-lg' },
  xl: { container: 'px-8 py-5 rounded-2xl', text: 'text-xl' },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  accessibilityLabel,
}: ButtonProps) {
  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      className={`
        flex-row items-center justify-center
        ${sizes.container}
        ${styles.container}
        ${disabled ? 'opacity-40' : ''}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <ActivityIndicator color={styles.spinner} />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Typography variant="button" className={`${sizes.text} ${styles.text} font-semibold`}>
            {title}
          </Typography>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </Pressable>
  );
}

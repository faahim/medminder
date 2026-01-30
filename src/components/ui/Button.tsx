import * as React from 'react';
import { Pressable, View, ActivityIndicator, ViewStyle, StyleProp } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors, radii, shadows, spacing, typography, touchTargets, animation } from '../../design/tokens';
import { Typography } from './Typography';
import { triggerHaptic } from '../../utils/haptics';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Kept for NativeWind compatibility across existing screens */
  className?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

function sizeTokens(size: ButtonSize) {
  switch (size) {
    case 'sm':
      return { minHeight: touchTargets.minimum, paddingH: spacing.md, paddingV: 10, radius: radii.md };
    case 'md':
      return { minHeight: touchTargets.comfortable, paddingH: spacing.lg, paddingV: 12, radius: radii.md };
    case 'lg':
      return { minHeight: touchTargets.large, paddingH: spacing.xl, paddingV: 14, radius: radii.lg };
    case 'xl':
      return { minHeight: 56, paddingH: spacing.xl, paddingV: 16, radius: radii.lg };
  }
}

function variantTokens(variant: ButtonVariant) {
  switch (variant) {
    case 'primary':
      return {
        bg: colors.primary[500],
        bgPressed: colors.primary[600],
        borderColor: colors.transparent,
        text: colors.white,
        spinner: colors.white,
        shadow: 'sm' as const,
      };
    case 'secondary':
      return {
        bg: colors.surface[100],
        bgPressed: colors.surface[200],
        borderColor: colors.surface[200],
        text: colors.surface[900],
        spinner: colors.surface[900],
        shadow: 'none' as const,
      };
    case 'outline':
      return {
        bg: colors.transparent,
        bgPressed: colors.primary[50],
        borderColor: colors.primary[500],
        text: colors.primary[600],
        spinner: colors.primary[600],
        shadow: 'none' as const,
      };
    case 'ghost':
      return {
        bg: colors.transparent,
        bgPressed: colors.surface[100],
        borderColor: colors.transparent,
        text: colors.primary[600],
        spinner: colors.primary[600],
        shadow: 'none' as const,
      };
    case 'danger':
      return {
        bg: colors.error[500],
        bgPressed: colors.error[600],
        borderColor: colors.transparent,
        text: colors.white,
        spinner: colors.white,
        shadow: 'sm' as const,
      };
    case 'success':
      return {
        bg: colors.success[500],
        bgPressed: colors.success[600],
        borderColor: colors.transparent,
        text: colors.white,
        spinner: colors.white,
        shadow: 'sm' as const,
      };
  }
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  style,
}: ButtonProps) {
  const scale = useSharedValue(1);
  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (!disabled && !loading) {
      triggerHaptic('light');
      onPress();
    }
  };

  const v = variantTokens(variant);
  const s = sizeTokens(size);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => {
        'worklet';
        scale.value = withSpring(0.97, {
          damping: 12,
          stiffness: 400,
          mass: 0.5,
        });
      }}
      onPressOut={() => {
        'worklet';
        scale.value = withSpring(1, {
          damping: 12,
          stiffness: 400,
          mass: 0.5,
        });
      }}
      disabled={disabled || loading}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      className={className}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          width: fullWidth ? '100%' : undefined,

          minHeight: s.minHeight,
          paddingHorizontal: s.paddingH,
          paddingVertical: s.paddingV,
          borderRadius: s.radius,
          borderWidth: v.borderColor === colors.transparent ? 0 : 1,
          borderColor: v.borderColor,

          backgroundColor: pressed ? v.bgPressed : v.bg,
          opacity: disabled ? 0.45 : pressed ? 0.92 : 1,

          borderCurve: 'continuous' as any,
          boxShadow: shadows[v.shadow] as any,
        },
        animatedScaleStyle,
        style as any,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.spinner} />
      ) : (
        <>
          {leftIcon ? <View style={{ marginRight: spacing.xs }}>{leftIcon}</View> : null}
          <Typography
            variant="button"
            style={{
              color: v.text,
              fontSize: typography.label.fontSize,
              fontWeight: '600',
            }}
          >
            {title}
          </Typography>
          {rightIcon ? <View style={{ marginLeft: spacing.xs }}>{rightIcon}</View> : null}
        </>
      )}
    </AnimatedPressable>
  );
}

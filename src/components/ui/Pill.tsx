import * as React from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { animation, colors, radii, spacing, typography } from '../../design/tokens';
import { Typography } from './Typography';

export type PillVariant = 'default' | 'primary' | 'secondary' | 'ghost';
export type PillSize = 'sm' | 'md';

export interface PillProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: PillVariant;
  size?: PillSize;
  selected?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
  /** Kept for NativeWind compatibility across existing screens */
  className?: string;
  style?: ViewStyle | ViewStyle[];
}

function variantTokens(variant: PillVariant, selected: boolean) {
  if (selected) {
    return {
      bg: colors.primary[500],
      bgPressed: colors.primary[600],
      border: colors.transparent,
      text: colors.white,
    };
  }

  switch (variant) {
    case 'primary':
      return {
        bg: colors.primary[50],
        bgPressed: colors.primary[100],
        border: colors.primary[200],
        text: colors.primary[700],
      };
    case 'secondary':
      return {
        bg: colors.surface[100],
        bgPressed: colors.surface[200],
        border: colors.surface[200],
        text: colors.surface[900],
      };
    case 'ghost':
      return {
        bg: colors.transparent,
        bgPressed: colors.surface[100],
        border: colors.transparent,
        text: colors.surface[700],
      };
    case 'default':
    default:
      return {
        bg: colors.surface[50],
        bgPressed: colors.surface[100],
        border: colors.surface[200],
        text: colors.surface[700],
      };
  }
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Pill({
  label,
  variant = 'default',
  size = 'md',
  selected = false,
  left,
  right,
  className = '',
  style,
  disabled,
  ...props
}: PillProps) {
  const scale = useSharedValue(1);
  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const v = variantTokens(variant, selected);
  const paddingH = size === 'md' ? spacing.md : spacing.sm;
  const paddingV = size === 'md' ? 10 : 8;

  return (
    <AnimatedPressable
      {...props}
      onPressIn={() => {
        'worklet';
        scale.value = withSpring(0.98, {
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
      disabled={disabled}
      className={className}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.xs,
          alignSelf: 'flex-start',
          paddingHorizontal: paddingH,
          paddingVertical: paddingV,
          borderRadius: radii.full,
          borderWidth: v.border === colors.transparent ? 0 : 1,
          borderColor: v.border,
          backgroundColor: pressed ? v.bgPressed : v.bg,
          opacity: disabled ? 0.45 : 1,
        },
        animatedScaleStyle,
        style,
      ]}
    >
      {left}
      <Typography
        variant="button"
        style={{
          color: v.text,
          fontSize: typography.label.fontSize,
          fontWeight: selected ? '700' : '600',
        }}
      >
        {label}
      </Typography>
      {right}
    </AnimatedPressable>
  );
}

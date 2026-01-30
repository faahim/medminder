import * as React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { colors, radii, spacing } from '../../design/tokens';
import { Typography } from './Typography';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends ViewProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  left?: React.ReactNode;
  /** Kept for NativeWind compatibility across existing screens */
  className?: string;
  style?: ViewStyle | ViewStyle[];
}

function variantColors(variant: BadgeVariant) {
  switch (variant) {
    case 'primary':
      return { bg: colors.primary[100], text: colors.primary[700], border: colors.primary[200] };
    case 'success':
      return { bg: colors.success[100], text: colors.success[700], border: colors.success[400] };
    case 'warning':
      return { bg: colors.warning[100], text: colors.warning[600], border: colors.warning[400] };
    case 'error':
      return { bg: colors.error[100], text: colors.error[600], border: colors.error[400] };
    case 'default':
    default:
      return { bg: colors.surface[100], text: colors.surface[700], border: colors.surface[200] };
  }
}

export function Badge({
  label,
  variant = 'default',
  size = 'sm',
  left,
  className = '',
  style,
  ...props
}: BadgeProps) {
  const v = variantColors(variant);
  const paddingH = size === 'md' ? spacing.sm : spacing.xs;
  const paddingV = size === 'md' ? 6 : 4;

  return (
    <View
      {...props}
      className={className}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          alignSelf: 'flex-start',
          paddingHorizontal: paddingH,
          paddingVertical: paddingV,
          borderRadius: radii.full,
          backgroundColor: v.bg,
          borderWidth: 1,
          borderColor: v.border,
        },
        style,
      ]}
    >
      {left}
      <Typography variant={size === 'md' ? 'label' : 'small'} style={{ color: v.text, textTransform: 'none', letterSpacing: 0 }}>
        {label}
      </Typography>
    </View>
  );
}

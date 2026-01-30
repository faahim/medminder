import * as React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { colors, radii, shadows } from '../../design/tokens';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  /** Kept for NativeWind compatibility across existing screens */
  className?: string;
  style?: ViewStyle | ViewStyle[];
  /** Optional: remove border for flat sections */
  bordered?: boolean;
  /** Optional: control elevation via tokenized shadows */
  elevation?: keyof typeof shadows;
}

export function Card({
  children,
  className = '',
  style,
  bordered = true,
  elevation = 'sm',
  ...props
}: CardProps) {
  return (
    <View
      {...props}
      className={className}
      style={[
        {
          backgroundColor: colors.white,
          borderRadius: radii.lg,
          // iOS-like continuous corners (RN supports this on iOS; harmless elsewhere)
          borderCurve: 'continuous' as any,
          borderWidth: bordered ? 1 : 0,
          borderColor: bordered ? colors.surface[200] : colors.transparent,
          // Prefer tokenized boxShadow over platform shadow props for consistency/animation readiness
          boxShadow: shadows[elevation] as any,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

import * as React from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';
import Animated, { AnimatedProps } from 'react-native-reanimated';
import { usePressAnimation } from '../../hooks/usePressAnimation';
import { colors, radii, shadows } from '../../design/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface AnimatedCardProps extends PressableProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle | ViewStyle[];
  scaleOnPress?: boolean;
  scaleValue?: number;
  disabled?: boolean;
}

/**
 * AnimatedCard
 *
 * A card component with built-in press scale animation.
 * Wraps children with an animated pressable that provides tactile feedback.
 *
 * @example
 * <AnimatedCard onPress={handlePress} style={styles.card}>
 *   <Text>Card content</Text>
 * </AnimatedCard>
 */
export function AnimatedCard({
  children,
  className = '',
  style,
  scaleOnPress = true,
  scaleValue = 0.97,
  disabled = false,
  ...props
}: AnimatedCardProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressAnimation(scaleValue);

  return (
    <AnimatedPressable
      {...props}
      onPressIn={scaleOnPress && !disabled ? onPressIn : undefined}
      onPressOut={scaleOnPress && !disabled ? onPressOut : undefined}
      disabled={disabled}
      className={className}
      style={({ pressed }) => [
        {
          backgroundColor: colors.white,
          borderRadius: radii.lg,
          borderCurve: 'continuous' as any,
          borderWidth: 1,
          borderColor: colors.surface[200],
          boxShadow: shadows.sm as any,
          opacity: disabled ? 0.5 : pressed && !scaleOnPress ? 0.9 : 1,
        },
        scaleOnPress ? animatedStyle : {},
        style,
      ]}
    >
      {children}
    </AnimatedPressable>
  );
}

/**
 * Non-pressable animated container variant
 */
export function AnimatedView({ children, style, ...props }: AnimatedProps<React.ComponentProps<typeof Animated.View>>) {
  return (
    <Animated.View
      {...props}
      style={[
        {
          backgroundColor: colors.white,
          borderRadius: radii.lg,
          borderCurve: 'continuous' as any,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

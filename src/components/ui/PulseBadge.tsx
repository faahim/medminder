import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Typography } from './Typography';
import { colors, radii } from '../../design/tokens';

export interface PulseBadgeProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  backgroundColor?: string;
  maxDigits?: number;
  style?: ViewStyle;
  showPulse?: boolean;
}

/**
 * PulseBadge
 *
 * Animated badge that pulses when the count changes or is non-zero.
 * Designed for use in tab bars or notification indicators.
 *
 * @example
 * <PulseBadge count={3} size="sm" showPulse={true} />
 */
export function PulseBadge({
  count,
  size = 'sm',
  color = colors.white,
  backgroundColor = colors.primary[500],
  maxDigits = 2,
  style,
  showPulse = true,
}: PulseBadgeProps) {
  const scale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  useEffect(() => {
    if (showPulse && count > 0) {
      // Pulse animation
      scale.value = withRepeat(
        withSequence(
          withSpring(1.15, { damping: 10, stiffness: 300 }),
          withSpring(1, { damping: 10, stiffness: 300 })
        ),
        -1,
        true
      );
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 800 }),
          withTiming(0.6, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      scale.value = 1;
      pulseOpacity.value = 0;
    }
  }, [count, showPulse, scale, pulseOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: scale.value }],
  }));

  const sizeConfig = {
    sm: { minWidth: 18, height: 18, fontSize: 10, paddingX: 4 },
    md: { minWidth: 22, height: 22, fontSize: 11, paddingX: 5 },
    lg: { minWidth: 26, height: 26, fontSize: 12, paddingX: 6 },
  }[size];

  const displayCount = count > Math.pow(10, maxDigits) - 1 ? `${Math.pow(10, maxDigits) - 1}+` : count.toString();

  if (count === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {/* Pulsing glow effect */}
      {showPulse && (
        <Animated.View
          style={[
            styles.glow,
            {
              backgroundColor,
              width: sizeConfig.minWidth + 8,
              height: sizeConfig.minWidth + 8,
            },
            glowStyle,
          ]}
        />
      )}
      {/* Badge */}
      <Animated.View
        style={[
          styles.badge,
          {
            backgroundColor,
            minWidth: sizeConfig.minWidth,
            height: sizeConfig.height,
            paddingHorizontal: sizeConfig.paddingX,
          },
          animatedStyle,
        ]}
      >
        <Typography
          variant="small"
          style={{
            color,
            fontSize: sizeConfig.fontSize,
            fontWeight: '700',
            lineHeight: sizeConfig.height,
          }}
        >
          {displayCount}
        </Typography>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
  },
  badge: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
});

/**
 * BounceBadge
 *
 * Badge that bounces once when the count changes.
 * Less distracting than continuous pulse for frequent updates.
 */
export function BounceBadge({
  count,
  size = 'sm',
  color = colors.white,
  backgroundColor = colors.primary[500],
  style,
}: Omit<PulseBadgeProps, 'showPulse' | 'maxDigits'>) {
  const scale = useSharedValue(1);
  const prevCount = useSharedValue(count);

  useEffect(() => {
    if (count !== prevCount.value) {
      // Bounce animation when count changes
      scale.value = withSpring(1.3, { damping: 8, stiffness: 400 });
      scale.value = withSpring(1, { damping: 10, stiffness: 300 });
      prevCount.value = count;
    }
  }, [count, scale, prevCount]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const sizeConfig = {
    sm: { minWidth: 18, height: 18, fontSize: 10, paddingX: 4 },
    md: { minWidth: 22, height: 22, fontSize: 11, paddingX: 5 },
    lg: { minWidth: 26, height: 26, fontSize: 12, paddingX: 6 },
  }[size];

  if (count === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.badge,
          {
            backgroundColor,
            minWidth: sizeConfig.minWidth,
            height: sizeConfig.height,
            paddingHorizontal: sizeConfig.paddingX,
          },
          animatedStyle,
        ]}
      >
        <Typography
          variant="small"
          style={{
            color,
            fontSize: sizeConfig.fontSize,
            fontWeight: '700',
            lineHeight: sizeConfig.height,
          }}
        >
          {count}
        </Typography>
      </Animated.View>
    </View>
  );
}

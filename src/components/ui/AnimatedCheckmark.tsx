import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../design/tokens';

interface AnimatedCheckmarkProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  show?: boolean;
}

/**
 * AnimatedCheckmark
 *
 * SVG-based checkmark that animates its path when shown.
 * Provides satisfying visual feedback when a dose is logged.
 *
 * @example
 * <AnimatedCheckmark show={isTaken} />
 */
export function AnimatedCheckmark({
  size = 64,
  color = colors.success[500],
  strokeWidth = 4,
  show = true,
}: AnimatedCheckmarkProps) {
  const progress = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    if (show) {
      // Animate scale first (pop in)
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
      // Then animate the checkmark path
      progress.value = withTiming(1, {
        duration: 500,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
    } else {
      progress.value = withTiming(0);
      scale.value = withTiming(0);
    }
  }, [show, progress, scale]);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  const checkmarkPathStyle = useAnimatedStyle(() => ({
    strokeDashoffset: (1 - progress.value) * 60,
  }));

  const center = size / 2;
  const radius = (size - strokeWidth) / 2 - 4;

  return (
    <Animated.View style={[styles.container, scaleStyle, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.2}
        />
        {/* Animated checkmark path */}
        <AnimatedPath
          d={`M ${center - radius * 0.3} ${center} L ${center - 2} ${center + radius * 0.3} L ${center + radius * 0.5} ${center - radius * 0.2}`}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={checkmarkPathStyle}
          strokeDasharray={60}
        />
      </Svg>
    </Animated.View>
  );
}

// Helper to create animated Path component
const AnimatedPath = Animated.createAnimatedComponent(Path);

/**
 * PulseCheckmark
 *
 * Checkmark with a pulsing glow effect.
 * Use for emphasis on dose completion.
 */
export function PulseCheckmark({
  size = 64,
  color = colors.success[500],
  show = true,
}: Omit<AnimatedCheckmarkProps, 'strokeWidth'>) {
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.5);

  useEffect(() => {
    if (show) {
      // Continuous pulse
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.2, { duration: 1000 }),
          withTiming(0.5, { duration: 1000 })
        ),
        -1,
        true
      );
    }
  }, [show, pulseScale, pulseOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return (
    <View style={{ width: size, height: size }}>
      {/* Pulsing glow background */}
      <Animated.View style={[styles.pulse, { backgroundColor: color }, pulseStyle]} />
      {/* Solid checkmark */}
      <View style={[styles.checkmarkContainer, { width: size, height: size }]}>
        <AnimatedCheckmark size={size} color={color} show={show} strokeWidth={4} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    inset: 0,
    borderRadius: 999,
  },
  checkmarkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

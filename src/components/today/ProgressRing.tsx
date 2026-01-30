import * as React from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { animation, colors } from '../../design/tokens';

/**
 * ProgressRing
 * - Pure RN views (no SVG dependency)
 * - Smoothly animates when `progress` changes
 */
export function ProgressRing({
  progress,
  size = 96,
  strokeWidth = 10,
  trackColor = colors.surface[200],
  progressColor = colors.primary[600],
  style,
}: {
  progress: number; // 0..1
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
  style?: ViewStyle;
}) {
  const p = useSharedValue(0);

  React.useEffect(() => {
    const next = Math.max(0, Math.min(1, progress));
    p.value = withTiming(next, { duration: animation.slow });
  }, [progress, p]);

  const rightDeg = useDerivedValue(() => {
    return interpolate(p.value, [0, 0.5], [0, 180], Extrapolate.CLAMP);
  });

  const leftDeg = useDerivedValue(() => {
    return interpolate(p.value, [0.5, 1], [0, 180], Extrapolate.CLAMP);
  });

  const rightStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rightDeg.value}deg` }],
  }));

  const leftStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${leftDeg.value}deg` }],
  }));

  const circleStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: strokeWidth,
  };

  return (
    <View style={[{ width: size, height: size }, style]}>
      {/* Track */}
      <View
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: trackColor,
        }}
      />

      {/* Right half (0..50%) */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: size / 2,
          height: size,
          overflow: 'hidden',
        }}
      >
        <Animated.View style={[{ position: 'absolute', right: 0, top: 0 }, rightStyle]}>
          <View style={[circleStyle, { borderColor: progressColor }]} />
        </Animated.View>
      </View>

      {/* Left half (50..100%) */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size / 2,
          height: size,
          overflow: 'hidden',
        }}
      >
        <Animated.View style={[{ position: 'absolute', left: 0, top: 0, transform: [{ rotateZ: '180deg' }] }, leftStyle]}>
          <View style={[circleStyle, { borderColor: progressColor }]} />
        </Animated.View>
      </View>
    </View>
  );
}

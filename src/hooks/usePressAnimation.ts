import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { animation } from '../design/tokens';

/**
 * Press Animation Hook
 *
 * Provides a subtle scale animation for pressable components.
 * Uses spring-based physics for natural, responsive feedback.
 *
 * @param scaleValue - Scale value when pressed (default: 0.97)
 * @returns Animated style and press handlers
 */
export function usePressAnimation(scaleValue = 0.97) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    'worklet';
    scale.value = withSpring(scaleValue, {
      damping: 12,
      stiffness: 400,
      mass: 0.5,
    });
  };

  const onPressOut = () => {
    'worklet';
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 400,
      mass: 0.5,
    });
  };

  return { animatedStyle, onPressIn, onPressOut };
}

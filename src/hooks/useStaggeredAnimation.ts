import Animated, { FadeInUp, FadeInRight, FadeIn, FadeInDown, LayoutAnimationConfig } from 'react-native-reanimated';

/**
 * Staggered List Animation Configuration
 *
 * Provides entering animations for list items with staggered delays.
 * Each item animates in slightly later than the previous one for a cascading effect.
 *
 * @param index - Item index in the list
 * @param delayPerItem - Delay in ms between each item (default: 50ms)
 * @param animationType - Type of entering animation (default: 'up')
 * @returns Reanimated entering prop for Animated.View
 */
export function useStaggeredAnimation(
  index: number,
  delayPerItem = 50,
  animationType: 'up' | 'right' | 'down' | 'fade' = 'up'
) {
  const delay = index * delayPerItem;

  switch (animationType) {
    case 'right':
      return FadeInRight.delay(delay).springify();
    case 'down':
      return FadeInDown.delay(delay).springify();
    case 'fade':
      return FadeIn.delay(delay).springify();
    case 'up':
    default:
      return FadeInUp.delay(delay).springify();
  }
}

/**
 * Layout Animation Configuration
 *
 * Provides smooth layout transitions when items reorder or change size.
 * Wraps list content for smooth position/scale changes.
 */
export const StaggeredLayout = LayoutAnimationConfig.springify();

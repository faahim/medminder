import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback utility for consistent user feedback
 * Only triggers on iOS - graceful no-op on Android
 */

export type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

/**
 * Trigger haptic feedback based on type
 * iOS only - Android gracefully does nothing
 */
export function triggerHaptic(type: HapticFeedbackType): void {
  // Only trigger haptics on iOS
  if (Platform.OS !== 'ios') {
    return;
  }

  try {
    switch (type) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'selection':
        Haptics.selectionAsync();
        break;
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (error) {
    // Haptics not supported on this device, silently fail
  }
}

/**
 * Trigger haptic only if haptic feedback is enabled in settings
 * iOS only - Android gracefully does nothing
 */
export function triggerHapticIfEnabled(enabled: boolean, type: HapticFeedbackType = 'light'): void {
  if (enabled) {
    triggerHaptic(type);
  }
}

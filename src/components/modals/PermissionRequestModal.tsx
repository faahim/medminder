import { Modal, Pressable, View } from 'react-native';
import { useEffect, useState } from 'react';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Modal as BaseModal } from '../ui/Modal';
import { colors, radii, spacing } from '../../design/tokens';

export interface PermissionRequestModalProps {
  visible: boolean;
  onRequestPermission: () => Promise<'granted' | 'denied' | 'not-determined'>;
  onDismiss: () => void;
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
}

const AnimatedView = Animated.View;

export function PermissionRequestModal({
  visible,
  onRequestPermission,
  onDismiss,
  onPermissionGranted,
  onPermissionDenied,
}: PermissionRequestModalProps) {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleAllow = async () => {
    setIsRequesting(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const status = await onRequestPermission();

      if (status === 'granted') {
        // Small delay to show success state
        await new Promise(resolve => setTimeout(resolve, 300));
        onPermissionGranted?.();
      } else {
        onPermissionDenied?.();
      }
    } catch (error) {
      console.error('[PermissionRequestModal] Failed to request permission:', error);
      onPermissionDenied?.();
    } finally {
      setIsRequesting(false);
    }
  };

  const handleNotNow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  };

  return (
    <BaseModal visible={visible} onDismiss={handleNotNow} backdropOpacity={0.5}>
      <AnimatedView entering={FadeIn.duration(300).springify()}>
        <View
          style={{
            backgroundColor: colors.surface[50],
            borderRadius: radii.xl,
            overflow: 'hidden',
            width: '90%',
            maxWidth: 360,
          }}
        >
          {/* Header with gradient background */}
          <LinearGradient
            colors={[colors.primary[600], colors.primary[500]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: spacing.xl,
              alignItems: 'center',
              paddingTop: spacing.xl + 8,
            }}
          >
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.md,
              }}
            >
              <Icon name="bell.fill" fallback="notifications" size={36} color={colors.white} />
            </View>
            <Typography
              variant="h3"
              style={{
                color: colors.white,
                fontWeight: '700',
                fontSize: 24,
                marginBottom: spacing.xs,
              }}
            >
              Enable Notifications
            </Typography>
            <Typography
              variant="body"
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center',
                fontSize: 15,
              }}
            >
              Stay on track with your medications
            </Typography>
          </LinearGradient>

          {/* Content */}
          <View style={{ padding: spacing.xl, paddingBottom: spacing.lg }}>
            <AnimatedView entering={FadeInDown.delay(150).springify()}>
              <View style={{ gap: spacing.md, marginBottom: spacing.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: radii.md,
                      backgroundColor: colors.primary[50],
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 2,
                    }}
                  >
                    <Icon name="checkmark.circle.fill" fallback="check-circle" size={18} color={colors.primary[600]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Typography
                      variant="label"
                      style={{
                        color: colors.surface[900],
                        fontWeight: '600',
                        marginBottom: 2,
                      }}
                    >
                      Never Miss a Dose
                    </Typography>
                    <Typography
                      variant="body"
                      style={{
                        color: colors.surface[600],
                        fontSize: 14,
                        lineHeight: 20,
                      }}
                    >
                      Get timely reminders for each scheduled medication
                    </Typography>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: radii.md,
                      backgroundColor: colors.success[50],
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 2,
                    }}
                  >
                    <Icon name="chart.bar.fill" fallback="bar-chart" size={18} color={colors.success[600]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Typography
                      variant="label"
                      style={{
                        color: colors.surface[900],
                        fontWeight: '600',
                        marginBottom: 2,
                      }}
                    >
                      Track Your Progress
                    </Typography>
                    <Typography
                      variant="body"
                      style={{
                        color: colors.surface[600],
                        fontSize: 14,
                        lineHeight: 20,
                      }}
                    >
                      See your daily adherence and build healthy habits
                    </Typography>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: radii.md,
                      backgroundColor: colors.warning[50],
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 2,
                    }}
                  >
                    <Icon name="exclamationmark.triangle.fill" fallback="warning" size={18} color={colors.warning[600]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Typography
                      variant="label"
                      style={{
                        color: colors.surface[900],
                        fontWeight: '600',
                        marginBottom: 2,
                      }}
                    >
                      Stay Ahead
                    </Typography>
                    <Typography
                      variant="body"
                      style={{
                        color: colors.surface[600],
                        fontSize: 14,
                        lineHeight: 20,
                      }}
                    >
                      Get advance reminders and missed dose alerts
                    </Typography>
                  </View>
                </View>
              </View>
            </AnimatedView>

            {/* Buttons */}
            <AnimatedView entering={FadeInDown.delay(250).springify()} style={{ gap: spacing.sm }}>
              <Button
                variant="primary"
                onPress={handleAllow}
                loading={isRequesting}
                style={{ width: '100%' }}
              >
                Allow Notifications
              </Button>
              <Button
                variant="ghost"
                onPress={handleNotNow}
                disabled={isRequesting}
                style={{ width: '100%' }}
              >
                Not Now
              </Button>
            </AnimatedView>

            {/* Privacy note */}
            <AnimatedView entering={FadeInDown.delay(300).springify()}>
              <Typography
                variant="small"
                style={{
                  color: colors.surface[400],
                  textAlign: 'center',
                  marginTop: spacing.md,
                  fontSize: 12,
                }}
              >
                You can change this anytime in Settings
              </Typography>
            </AnimatedView>
          </View>
        </View>
      </AnimatedView>
    </BaseModal>
  );
}

import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii } from '../../design/tokens';
import { Typography } from '../ui/Typography';
import * as Haptics from 'expo-haptics';

interface WizardSuccessAnimationProps {
  medicationName: string;
  onComplete?: () => void;
}

export function WizardSuccessAnimation({ medicationName, onComplete }: WizardSuccessAnimationProps) {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const checkmarkAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Animate circle scale in
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Animate opacity
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 300,
      delay: 100,
      useNativeDriver: true,
    }).start();

    // Animate checkmark path
    Animated.timing(checkmarkAnim, {
      toValue: 1,
      duration: 500,
      delay: 300,
      useNativeDriver: true,
    }).start();

    // Auto-complete after 2 seconds
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.circleContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.successCircle,
            {
              opacity: opacityAnim,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.checkmarkContainer,
              {
                opacity: checkmarkAnim,
                transform: [
                  {
                    scale: checkmarkAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 1.2, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons name="checkmark" size={48} color="white" />
          </Animated.View>
        </Animated.View>
      </Animated.View>

      <Animated.View style={{ opacity: opacityAnim }}>
        <Typography variant="h1" style={styles.title}>
          Medication Added!
        </Typography>
        <Typography variant="body" style={styles.medicationName}>
          {medicationName}
        </Typography>
        <Typography variant="body" style={styles.message}>
          You'll be reminded at the right times.
        </Typography>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface[50],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  circleContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.success[500],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.success[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  checkmarkContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.surface[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  medicationName: {
    color: colors.primary[600],
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    color: colors.surface[500],
    textAlign: 'center',
  },
});

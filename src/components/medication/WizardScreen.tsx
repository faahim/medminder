import { View, StyleSheet, Pressable, Alert } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii } from '../../design/tokens';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { Screen } from '../layout/Screen';

export interface WizardScreenProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  onNext: () => void;
  onBack?: () => void;
  canProceed: boolean;
  nextLabel?: string;
  backLabel?: string;
  children: React.ReactNode;
  showProgress?: boolean;
  hasUnsavedChanges?: boolean;
  keyboardAvoiding?: boolean;
  padBottomExtra?: number;
}

const AnimatedScreen = Animated.createAnimatedComponent(Screen);

export function WizardScreen({
  stepNumber,
  totalSteps,
  title,
  subtitle,
  onNext,
  onBack,
  canProceed,
  nextLabel = 'Next',
  backLabel = 'Back',
  children,
  showProgress = true,
  hasUnsavedChanges = false,
  keyboardAvoiding = false,
  padBottomExtra = 140,
}: WizardScreenProps) {
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (hasUnsavedChanges && stepNumber > 1) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved information. Do you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go Back', style: 'destructive', onPress: onBack },
        ]
      );
    } else {
      onBack?.();
    }
  };

  const progress = (stepNumber / totalSteps) * 100;

  return (
    <View style={styles.container}>
      {showProgress && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.progressHeader}>
          <View style={styles.progressInfo}>
            <Typography variant="small" style={styles.stepText}>
              Step {stepNumber} of {totalSteps}
            </Typography>
            <Typography variant="small" style={styles.progressText}>
              {Math.round(progress)}% complete
            </Typography>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  { width: `${progress}%` },
                ]}
              />
            </View>
          </View>
        </Animated.View>
      )}

      <AnimatedScreen
        scroll={keyboardAvoiding}
        keyboardAvoiding={keyboardAvoiding}
        includeTopInset={false}
        padX={spacing.lg}
        padY={spacing.lg}
        padBottomExtra={padBottomExtra}
      >
        <Animated.View entering={FadeInRight.duration(300).springify()} exiting={FadeOutLeft.duration(200)}>
          <Typography variant="h2" style={styles.title}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body" style={styles.subtitle}>
              {subtitle}
            </Typography>
          )}
        </Animated.View>

        <Animated.View
          entering={FadeInRight.delay(100).duration(300).springify()}
          exiting={FadeOutLeft.duration(200)}
          style={styles.content}
        >
          {children}
        </Animated.View>
      </AnimatedScreen>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.footerButtons}>
          {stepNumber > 1 && (
            <Button
              title={backLabel}
              variant="secondary"
              size="lg"
              onPress={handleBack}
              style={styles.backButton}
            />
          )}
          <Button
            title={stepNumber === totalSteps ? 'Review' : nextLabel}
            size="lg"
            onPress={onNext}
            disabled={!canProceed}
            style={[styles.nextButton, stepNumber > 1 ? {} : styles.nextButtonFull]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface[50],
  },
  progressHeader: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface[100],
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  stepText: {
    color: colors.surface[500],
    fontWeight: '500',
  },
  progressText: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
  },
  progressBarBackground: {
    height: '100%',
    backgroundColor: colors.surface[200],
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
  },
  screen: {
    flex: 1,
  },
  title: {
    color: colors.surface[900],
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.surface[500],
    marginBottom: spacing.lg,
  },
  content: {
    flex: 1,
  },
  footer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.surface[100],
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
  },
  nextButtonFull: {
    flex: 1,
  },
});

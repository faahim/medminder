import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii } from '../../design/tokens';

export interface WizardStep {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export interface WizardProgressProps {
  steps: WizardStep[];
  currentStep: number;
}

export function WizardProgress({ steps, currentStep }: WizardProgressProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <View key={index} style={styles.stepWrapper}>
              <View
                style={[
                  styles.stepDot,
                  isCompleted && styles.stepDotCompleted,
                  isCurrent && styles.stepDotCurrent,
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={14} color="white" />
                ) : (
                  <Ionicons
                    name={step.icon}
                    size={16}
                    color={isCurrent ? colors.primary[500] : colors.surface[300]}
                  />
                )}
              </View>

              {!isLast && (
                <View
                  style={[
                    styles.stepLine,
                    isCompleted && styles.stepLineCompleted,
                    isCurrent && styles.stepLineCurrent,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.currentLabelContainer}>
        <Ionicons
          name={steps[currentStep].icon}
          size={20}
          color={colors.primary[500]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface[100],
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface[200],
  },
  stepDotCompleted: {
    backgroundColor: colors.success[500],
    borderColor: colors.success[500],
  },
  stepDotCurrent: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.surface[200],
    marginHorizontal: spacing.xs,
  },
  stepLineCompleted: {
    backgroundColor: colors.success[500],
  },
  stepLineCurrent: {
    backgroundColor: colors.primary[300],
  },
  currentLabelContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});

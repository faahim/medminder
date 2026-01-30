import { Pressable, View } from 'react-native';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import type { Medication } from '../../types';
import { colors, radii, spacing } from '../../design';

import { Card } from '../ui/Card';
import { Typography } from '../ui/Typography';
// Button replaced by inline pill action
import { Badge } from '../ui/Badge';
import { Icon } from '../ui/Icon';
import { MealTimingBadge } from './MealTimingBadge';

interface AsNeededCardProps {
  medication: Medication;
  onLogDose: (medicationId: string) => Promise<void>;
  todayCount?: number;
}

export function AsNeededCard({ medication, onLogDose, todayCount = 0 }: AsNeededCardProps) {
  const [isLogging, setIsLogging] = useState(false);
  const [localCount, setLocalCount] = useState(todayCount);

  const pressed = useSharedValue(0);
  const pressStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, 0.98]);
    return { transform: [{ scale }] };
  });

  const handleLogDose = async () => {
    setIsLogging(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await onLogDose(medication.id);
      setLocalCount((prev) => prev + 1);
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <Card
      elevation="sm"
      style={{
        borderColor: colors.warning[100],
        borderWidth: 1,
      }}
    >
      <View style={{ padding: spacing.md, gap: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: radii.md,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: spacing.md,
              backgroundColor: `${medication.color}14`,
            }}
          >
            <Icon name="bolt.fill" fallback="flash" size={24} color={medication.color} weight="semibold" />
          </View>

          <View style={{ flex: 1, gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
              <Typography variant="h3" style={{ color: colors.surface[900], fontWeight: '700' }}>
                {medication.name}
              </Typography>
              <Badge label="PRN" variant="warning" />
            </View>
            <Typography variant="small" style={{ color: colors.surface[500] }}>
              {medication.dosage} {medication.dosageUnit}
            </Typography>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
              <MealTimingBadge timing={medication.mealTiming} />
              {localCount > 0 ? (
                <Badge
                  label={`${localCount}× today`}
                  variant="success"
                  left={<Icon name="checkmark.circle.fill" fallback="checkmark-circle" size={14} color={colors.success[600]} />}
                />
              ) : null}
            </View>
          </View>

          <Animated.View style={pressStyle}>
            <Pressable
              onPress={handleLogDose}
              disabled={isLogging}
              onPressIn={() => {
                pressed.value = withSpring(1, { damping: 18, stiffness: 240 });
              }}
              onPressOut={() => {
                pressed.value = withSpring(0, { damping: 18, stiffness: 240 });
              }}
              style={{
                minHeight: 44,
                paddingHorizontal: 14,
                borderRadius: radii.full,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: colors.primary[600],
              }}
              accessibilityRole="button"
              accessibilityLabel={`Log PRN dose for ${medication.name}`}
            >
              <Icon name="plus" fallback="add" size={16} color={colors.white} weight="bold" />
              <Typography variant="button" style={{ color: colors.white, fontWeight: '800' }}>
                {isLogging ? 'Logging…' : 'Log'}
              </Typography>
            </Pressable>
          </Animated.View>
        </View>

        {medication.instructions ? (
          <View style={{ paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.surface[100] }}>
            <Typography variant="small" style={{ color: colors.surface[500] }}>
              {medication.instructions}
            </Typography>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

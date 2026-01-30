import { View, Pressable } from 'react-native';
import { useState } from 'react';

import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { Badge } from '../ui/Badge';
import { MealTimingBadge } from './MealTimingBadge';
import { triggerHaptic } from '../../utils/haptics';

import type { ScheduledDose, DoseStatus } from '../../types';
import { colors, radii, spacing, shadows } from '../../design';

interface DoseCardProps {
  dose: ScheduledDose;
  onStatusChange: (status: DoseStatus) => void;
  onLogDose?: (medicationId: string, date: string, time: string, status: DoseStatus) => Promise<void>;
  onSnooze?: (medicationId: string, time: string, minutes: number) => Promise<void>;
  hasNotification?: boolean;
  hasMissedFollowUp?: boolean;
}

function statusTokens(status: DoseStatus) {
  switch (status) {
    case 'taken':
      return {
        bg: colors.success[50],
        border: colors.success[100],
        icon: { name: 'checkmark.circle.fill' as const, fallback: 'checkmark-circle' as const, color: colors.success[600] },
        label: 'Taken',
        labelColor: colors.success[700],
      };
    case 'missed':
      return {
        bg: colors.error[50],
        border: colors.error[100],
        icon: { name: 'xmark.circle.fill' as const, fallback: 'close-circle' as const, color: colors.error[600] },
        label: 'Missed',
        labelColor: colors.error[600],
      };
    case 'skipped':
      return {
        bg: colors.surface[100],
        border: colors.surface[200],
        icon: { name: 'minus.circle.fill' as const, fallback: 'remove-circle-outline' as const, color: colors.surface[500] },
        label: 'Skipped',
        labelColor: colors.surface[700],
      };
    case 'pending':
    default:
      return {
        bg: colors.white,
        border: colors.surface[200],
        icon: null,
        label: null,
        labelColor: colors.surface[700],
      };
  }
}

function formatTimeParts(scheduledTime: string) {
  const [h, m] = scheduledTime.split(':');
  return { h, m };
}

export function DoseCard({ dose, onStatusChange, onLogDose, onSnooze, hasNotification = false, hasMissedFollowUp = false }: DoseCardProps) {
  const [isLogging, setIsLogging] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);

  const handleTake = async () => {
    setIsLogging(true);
    try {
      triggerHaptic('medium');
      if (onLogDose) {
        await onLogDose(dose.medication.id, dose.scheduledDate, dose.scheduledTime, 'taken');
      }
      onStatusChange('taken');
      triggerHaptic('success');
    } finally {
      setIsLogging(false);
      setShowActions(false);
      setShowSnoozeOptions(false);
    }
  };

  const handleSkip = async () => {
    setIsLogging(true);
    try {
      triggerHaptic('light');
      if (onLogDose) {
        await onLogDose(dose.medication.id, dose.scheduledDate, dose.scheduledTime, 'skipped');
      }
      onStatusChange('skipped');
    } finally {
      setIsLogging(false);
      setShowActions(false);
      setShowSnoozeOptions(false);
    }
  };

  const handleSnooze = async (minutes: number) => {
    setIsLogging(true);
    try {
      triggerHaptic('medium');
      if (onSnooze) {
        await onSnooze(dose.medication.id, dose.scheduledTime, minutes);
      }
    } finally {
      setIsLogging(false);
      setShowActions(false);
      setShowSnoozeOptions(false);
    }
  };

  const s = statusTokens(dose.status);
  const t = formatTimeParts(dose.scheduledTime);

  return (
    <Card
      elevation="sm"
      style={{
        backgroundColor: s.bg,
        borderColor: s.border,
        borderWidth: 1,
        borderRadius: radii.lg,
        borderCurve: 'continuous' as any,
      }}
    >
      <View style={{ padding: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: radii.md,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: spacing.md,
              backgroundColor: `${dose.medication.color}14`,
            }}
          >
            <Typography variant="h3" style={{ color: dose.medication.color, fontWeight: '800' }}>
              {t.h}
            </Typography>
            <Typography variant="small" style={{ color: dose.medication.color, opacity: 0.75, marginTop: -2 }}>
              {t.m}
            </Typography>
          </View>

          <View style={{ flex: 1, gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }}>
              <Typography variant="h3" style={{ color: colors.surface[900], fontWeight: '700', flexShrink: 1 }}>
                {dose.medication.name}
              </Typography>
              {dose.status !== 'pending' && s.icon ? (
                <Icon
                  name={s.icon.name}
                  fallback={s.icon.fallback}
                  size={30}
                  color={s.icon.color}
                  weight="semibold"
                />
              ) : null}
            </View>
            <Typography variant="small" style={{ color: colors.surface[500] }}>
              {dose.medication.dosage} {dose.medication.dosageUnit}
            </Typography>
            <MealTimingBadge timing={dose.medication.mealTiming} />
          </View>
        </View>

        {dose.status === 'pending' ? (
          <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
            {/* Missed dose follow-up indicator */}
            {hasMissedFollowUp && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs, backgroundColor: colors.warning[50], padding: spacing.xs, borderRadius: radii.sm }}>
                <Icon name="exclamationmark.triangle.fill" fallback="warning" size={14} color={colors.warning[600]} />
                <Typography variant="small" style={{ color: colors.warning[700] }}>
                  Follow-up reminder scheduled
                </Typography>
              </View>
            )}

            {/* Reminder scheduled indicator (only show if no missed follow-up) */}
            {hasNotification && !hasMissedFollowUp && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs }}>
                <Icon name="bell.fill" fallback="notifications" size={14} color={colors.primary[600]} />
                <Typography variant="small" style={{ color: colors.primary[700] }}>
                  Reminder scheduled
                </Typography>
              </View>
            )}

            {!showSnoozeOptions ? (
              !showActions ? (
                <Button
                  title={isLogging ? 'Logging…' : 'Take now'}
                  onPress={handleTake}
                  disabled={isLogging}
                  loading={isLogging}
                  leftIcon={<Icon name="checkmark" fallback="checkmark" size={18} color={colors.white} weight="bold" />}
                  fullWidth
                />
              ) : (
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <View style={{ flex: 1 }}>
                    <Button
                      title="Take"
                      onPress={handleTake}
                      disabled={isLogging}
                      loading={isLogging}
                      leftIcon={<Icon name="checkmark" fallback="checkmark" size={18} color={colors.white} weight="bold" />}
                      fullWidth
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button
                      title="Skip"
                      onPress={handleSkip}
                      disabled={isLogging}
                      variant="secondary"
                      leftIcon={<Icon name="xmark" fallback="close" size={18} color={colors.surface[900]} weight="bold" />}
                      fullWidth
                    />
                  </View>
                </View>
              )
            ) : (
              /* Snooze options */
              <View style={{ gap: spacing.sm }}>
                <Typography variant="small" style={{ color: colors.surface[600], textAlign: 'center' }}>
                  Snooze for how long?
                </Typography>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <View style={{ flex: 1 }}>
                    <Pressable
                      onPress={() => handleSnooze(15)}
                      disabled={isLogging}
                      style={{
                        paddingVertical: spacing.sm,
                        paddingHorizontal: spacing.sm,
                        borderRadius: radii.md,
                        backgroundColor: colors.surface[100],
                        borderWidth: 1,
                        borderColor: colors.surface[200],
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="label" style={{ color: colors.surface[900] }}>15m</Typography>
                    </Pressable>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Pressable
                      onPress={() => handleSnooze(30)}
                      disabled={isLogging}
                      style={{
                        paddingVertical: spacing.sm,
                        paddingHorizontal: spacing.sm,
                        borderRadius: radii.md,
                        backgroundColor: colors.surface[100],
                        borderWidth: 1,
                        borderColor: colors.surface[200],
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="label" style={{ color: colors.surface[900] }}>30m</Typography>
                    </Pressable>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Pressable
                      onPress={() => handleSnooze(60)}
                      disabled={isLogging}
                      style={{
                        paddingVertical: spacing.sm,
                        paddingHorizontal: spacing.sm,
                        borderRadius: radii.md,
                        backgroundColor: colors.surface[100],
                        borderWidth: 1,
                        borderColor: colors.surface[200],
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="label" style={{ color: colors.surface[900] }}>1h</Typography>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}

            <Button
              title={showSnoozeOptions ? 'Cancel' : showActions ? 'Cancel' : 'More options'}
              onPress={() => {
                if (showSnoozeOptions) {
                  setShowSnoozeOptions(false);
                  setShowActions(true);
                } else {
                  setShowActions((v) => !v);
                }
              }}
              variant="ghost"
              size="sm"
              leftIcon={
                <Icon
                  name={showSnoozeOptions ? 'xmark' : showActions ? 'xmark' : 'ellipsis'}
                  fallback={showSnoozeOptions ? 'close' : showActions ? 'close' : 'ellipsis-horizontal'}
                  size={16}
                  color={colors.primary[600]}
                />
              }
              fullWidth
              style={{ boxShadow: shadows.none as any }}
            />

            {/* Snooze button (shown when not in expanded actions) */}
            {!showActions && !showSnoozeOptions && hasNotification && (
              <Button
                title="Snooze"
                onPress={() => setShowSnoozeOptions(true)}
                variant="ghost"
                size="sm"
                leftIcon={
                  <Icon
                    name="clock"
                    fallback="time-outline"
                    size={16}
                    color={colors.surface[600]}
                  />
                }
                fullWidth
                style={{ boxShadow: shadows.none as any }}
              />
            )}

            {/* Snooze button in expanded actions */}
            {showActions && !showSnoozeOptions && (
              <Button
                title="Snooze"
                onPress={() => setShowSnoozeOptions(true)}
                variant="ghost"
                size="sm"
                leftIcon={
                  <Icon
                    name="clock"
                    fallback="time-outline"
                    size={16}
                    color={colors.surface[600]}
                  />
                }
                fullWidth
                style={{ boxShadow: shadows.none as any }}
              />
            )}
          </View>
        ) : s.label ? (
          <View style={{ marginTop: spacing.sm, alignItems: 'center' }}>
            <Typography variant="label" style={{ color: s.labelColor, fontWeight: '700' }}>
              {s.label}
            </Typography>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

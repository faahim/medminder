import { useState } from 'react';
import { Modal as ExpoModal, View, Pressable, Alert, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Typography } from '../ui/Typography';
import { Icon } from '../ui/Icon';
import { colors, radii, spacing } from '../../design/tokens';

const skipReasons = [
  { id: 'already-took', label: 'Already took it', icon: 'checkmark.circle.fill' },
  { id: 'not-available', label: 'Not available right now', icon: 'exclamationmark.triangle.fill' },
  { id: 'feeling-better', label: 'Feeling better', icon: 'heart.fill' },
  { id: 'side-effects', label: 'Experiencing side effects', icon: 'exclamationmark.octagon.fill' },
  { id: 'doctor-advised', label: 'Doctor advised not to take', icon: 'stethoscope' },
  { id: 'forgot', label: 'Forgot / Missed', icon: 'clock.fill' },
  { id: 'other', label: 'Other reason...', icon: 'ellipsis' },
];

interface SkipModalProps {
  visible: boolean;
  onClose: () => void;
  onSkip: (reason: string) => void;
  medicationName?: string;
}

export function SkipModal({ visible, onClose, onSkip, medicationName }: SkipModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('already-took');
  const [customReason, setCustomReason] = useState('');

  const handleReasonPress = (reasonId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedReason(reasonId);
    if (reasonId !== 'other') {
      setCustomReason('');
    }
  };

  const handleConfirm = async () => {
    let reason = '';
    if (selectedReason === 'other') {
      reason = customReason.trim();
      if (!reason) {
        Alert.alert('Reason Required', 'Please enter a reason for skipping this dose.');
        return;
      }
    } else {
      const reasonOption = skipReasons.find(r => r.id === selectedReason);
      reason = reasonOption?.label || '';
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    await onSkip(reason);
    onClose();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const isOtherSelected = selectedReason === 'other';

  return (
    <ExpoModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
          <View style={{ backgroundColor: colors.white, borderRadius: radii.xl, width: '100%', maxWidth: 380, overflow: 'hidden', borderCurve: 'continuous' as any, maxHeight: '80%' }}>
            {/* Header */}
            <View style={{ padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.surface[100], alignItems: 'center' }}>
              <View style={{ width: 48, height: 48, borderRadius: radii.lg, backgroundColor: colors.error[50], alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }}>
                <Icon name="minus.circle.fill" fallback="remove-circle" size={24} color={colors.error[500]} />
              </View>
              <Typography variant="h3" style={{ color: colors.surface[900], fontWeight: '700', marginTop: spacing.sm }}>
                Skip Dose
              </Typography>
              {medicationName && (
                <Typography variant="small" style={{ color: colors.surface[500], marginTop: 4 }}>
                  {medicationName}
                </Typography>
              )}
            </View>

            {/* Reason Options */}
            <ScrollView style={{ padding: spacing.lg, maxHeight: 300 }}>
              <Typography variant="label" style={{ color: colors.surface[500], marginBottom: spacing.md, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                Why are you skipping?
              </Typography>

              {skipReasons.map((reason) => (
                <Pressable
                  key={reason.id}
                  onPress={() => handleReasonPress(reason.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: spacing.md,
                    borderRadius: radii.md,
                    backgroundColor: selectedReason === reason.id ? colors.error[50] : colors.surface[50],
                    marginBottom: spacing.sm,
                    borderWidth: 1,
                    borderColor: selectedReason === reason.id ? colors.error[100] : 'transparent',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{ width: 32, height: 32, borderRadius: radii.md, backgroundColor: selectedReason === reason.id ? colors.error[100] : colors.surface[100], alignItems: 'center', justifyContent: 'center', marginRight: spacing.md }}>
                      <Icon
                        name={reason.icon as any}
                        fallback="info-circle"
                        size={16}
                        color={selectedReason === reason.id ? colors.error[500] : colors.surface[700]}
                      />
                    </View>
                    <Typography variant="body" style={{ color: colors.surface[900], flex: 1 }}>
                      {reason.label}
                    </Typography>
                  </View>
                  {selectedReason === reason.id && (
                    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: colors.error[500], alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="checkmark" fallback="check" size={12} color={colors.white} weight="bold" />
                    </View>
                  )}
                </Pressable>
              ))}

              {/* Custom Reason Input */}
              {isOtherSelected && (
                <View style={{ marginTop: spacing.md }}>
                  <Typography variant="small" style={{ color: colors.surface[500], marginBottom: spacing.xs }}>
                    Please explain:
                  </Typography>
                  <TextInput
                    value={customReason}
                    onChangeText={setCustomReason}
                    placeholder="Enter reason..."
                    placeholderTextColor={colors.surface[400]}
                    multiline
                    numberOfLines={3}
                    style={{
                      borderWidth: 1,
                      borderColor: colors.surface[300],
                      borderRadius: radii.md,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      backgroundColor: colors.surface[50],
                      color: colors.surface[900],
                      minHeight: 80,
                      textAlignVertical: 'top',
                      fontSize: 16,
                    }}
                    autoFocus={isOtherSelected}
                  />
                </View>
              )}
            </ScrollView>

            {/* Actions */}
            <View style={{ flexDirection: 'row', padding: spacing.lg, gap: spacing.md, borderTopWidth: 1, borderTopColor: colors.surface[100] }}>
              <Pressable
                onPress={handleClose}
                style={{ flex: 1, paddingVertical: spacing.md, borderRadius: radii.md, backgroundColor: colors.surface[100], alignItems: 'center', justifyContent: 'center' }}
              >
                <Typography variant="body" style={{ color: colors.surface[700], fontWeight: '600' }}>
                  Cancel
                </Typography>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                style={{ flex: 1, paddingVertical: spacing.md, borderRadius: radii.md, backgroundColor: colors.error[500], alignItems: 'center', justifyContent: 'center' }}
              >
                <Typography variant="body" style={{ color: colors.white, fontWeight: '600' }}>
                  Skip
                </Typography>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ExpoModal>
  );
}

import { Modal, View, Pressable, Alert, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Modal as ExpoModal } from 'react-native';
import { useState } from 'react';

import { Typography } from '../ui/Typography';
import { Icon } from '../ui/Icon';
import { colors, radii, spacing } from '../../design/tokens';

interface SnoozeOption {
  label: string;
  value: number;
}

const snoozeOptions: SnoozeOption[] = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
  { label: 'Custom...', value: 0 },
];

interface SnoozeModalProps {
  visible: boolean;
  onClose: () => void;
  onSnooze: (minutes: number) => void;
  medicationName?: string;
}

export function SnoozeModal({ visible, onClose, onSnooze, medicationName }: SnoozeModalProps) {
  const [selectedValue, setSelectedValue] = useState<number>(15);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('15');

  const handleOptionPress = (value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (value === 0) {
      setShowCustomInput(true);
      setSelectedValue(0);
    } else {
      setSelectedValue(value);
    }
  };

  const handleConfirm = async () => {
    const minutes = selectedValue === 0 ? parseInt(customMinutes, 10) : selectedValue;
    if (isNaN(minutes) || minutes < 1 || minutes > 480) {
      Alert.alert('Invalid Time', 'Please enter a value between 1 and 480 minutes (8 hours).');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await onSnooze(minutes);
    setShowCustomInput(false);
    onClose();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowCustomInput(false);
    onClose();
  };

  return (
    <ExpoModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
        <View style={{ backgroundColor: colors.white, borderRadius: radii.xl, width: '100%', maxWidth: 340, overflow: 'hidden', borderCurve: 'continuous' as any }}>
          {/* Header */}
          <View style={{ padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.surface[100], alignItems: 'center' }}>
            <View style={{ width: 48, height: 48, borderRadius: radii.lg, backgroundColor: colors.warning[50], alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }}>
              <Icon name="clock.fill" fallback="time" size={24} color={colors.warning[500]} />
            </View>
            <Typography variant="h3" style={{ color: colors.surface[900], fontWeight: '700', marginTop: spacing.sm }}>
              Snooze Reminder
            </Typography>
            {medicationName && (
              <Typography variant="small" style={{ color: colors.surface[500], marginTop: 4 }}>
                {medicationName}
              </Typography>
            )}
          </View>

          {/* Snooze Options */}
          <View style={{ padding: spacing.lg }}>
            <Typography variant="label" style={{ color: colors.surface[500], marginBottom: spacing.md, textTransform: 'uppercase', letterSpacing: 1.2 }}>
              Snooze for:
            </Typography>

            {snoozeOptions.map((option) => (
              <Pressable
                key={option.label}
                onPress={() => handleOptionPress(option.value)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: spacing.md,
                  borderRadius: radii.md,
                  backgroundColor: selectedValue === option.value ? colors.primary[50] : colors.surface[50],
                  marginBottom: spacing.sm,
                  borderWidth: 1,
                  borderColor: selectedValue === option.value ? colors.primary[200] : 'transparent',
                }}
              >
                <Typography variant="body" style={{ color: colors.surface[900] }}>
                  {option.label}
                </Typography>
                {selectedValue === option.value && (
                  <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary[500], alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="checkmark" fallback="check" size={12} color={colors.white} weight="bold" />
                  </View>
                )}
              </Pressable>
            ))}

            {/* Custom Input */}
            {showCustomInput && (
              <View style={{ marginTop: spacing.md }}>
                <Typography variant="small" style={{ color: colors.surface[500], marginBottom: spacing.xs }}>
                  Enter minutes (1-480):
                </Typography>
                <TextInput
                  value={customMinutes}
                  onChangeText={setCustomMinutes}
                  placeholder="15"
                  placeholderTextColor={colors.surface[400]}
                  keyboardType="number-pad"
                  maxLength={3}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.surface[300],
                    borderRadius: radii.md,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    backgroundColor: colors.surface[50],
                    color: colors.surface[900],
                    fontSize: 16,
                  }}
                  autoFocus
                />
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={{ flexDirection: 'row', padding: spacing.lg, paddingTop: 0, gap: spacing.md }}>
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
              style={{ flex: 1, paddingVertical: spacing.md, borderRadius: radii.md, backgroundColor: colors.warning[500], alignItems: 'center', justifyContent: 'center' }}
            >
              <Typography variant="body" style={{ color: colors.white, fontWeight: '600' }}>
                Snooze
              </Typography>
            </Pressable>
          </View>
        </View>
      </View>
    </ExpoModal>
  );
}

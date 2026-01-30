import * as React from 'react';
import { View, Pressable, Platform, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, radii, spacing } from '../../design/tokens';
import { Typography } from './Typography';
import { Icon } from './Icon';
import { Button } from './Button';

export interface DatePickerModalProps {
  visible: boolean;
  date: Date;
  onDateChange: (date: Date) => void;
  onClose: () => void;
  minimumDate?: Date;
  maximumDate?: Date;
  title?: string;
}

export function DatePickerModal({
  visible,
  date,
  onDateChange,
  onClose,
  minimumDate,
  maximumDate,
  title = 'Select Date',
}: DatePickerModalProps) {
  const [tempDate, setTempDate] = React.useState(date);

  React.useEffect(() => {
    setTempDate(date);
  }, [date]);

  const handleChange = (_: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      if (selectedDate) {
        onDateChange(selectedDate);
        onClose();
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleConfirm = () => {
    onDateChange(tempDate);
    onClose();
  };

  const handleToday = () => {
    const today = new Date();
    setTempDate(today);
    if (Platform.OS === 'android') {
      onDateChange(today);
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h3" style={styles.title}>
            {title}
          </Typography>
          <Pressable onPress={onClose} hitSlop={8} style={styles.closeButton}>
            <Icon name="xmark.circle.fill" fallback="close-circle" size="md" color={colors.surface[500]} />
          </Pressable>
        </View>

        {/* Date Display */}
        <View style={styles.dateDisplay}>
          <Typography variant="display" style={styles.dateText}>
            {format(tempDate, 'MMM d, yyyy')}
          </Typography>
        </View>

        {/* Picker */}
        <DateTimePicker
          value={tempDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          style={styles.picker}
          themeVariant="light"
        />

        {/* Actions */}
        {Platform.OS === 'ios' && (
          <View style={styles.actions}>
            <Button
              variant="secondary"
              size="md"
              title="Today"
              onPress={handleToday}
              style={styles.actionButton}
              leftIcon={<Icon name="calendar" fallback="calendar-outline" size="sm" color={colors.surface[700]} />}
            />
            <Button
              variant="primary"
              size="md"
              title="Done"
              onPress={handleConfirm}
              style={styles.actionButton}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing['2xl'] : spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing.xs,
  },
  dateDisplay: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface[50],
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
  },
  dateText: {
    color: colors.primary[600],
    fontSize: 28,
    fontWeight: '700',
  },
  picker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 200 : undefined,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});

import { View, Pressable, Platform } from 'react-native';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Typography } from './Typography';
import { Ionicons } from '@expo/vector-icons';

interface TimePickerProps {
  value: string; // "HH:mm" format
  onChange: (time: string) => void;
  label?: string;
}

export function TimePicker({ value, onChange, label }: TimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const parseTime = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDisplay = (timeStr: string): string => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const handleChange = (_: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selectedDate) onChange(formatTime(selectedDate));
  };

  return (
    <View>
      {label ? (
        <Typography variant="label" className="text-surface-600 mb-2">
          {label}
        </Typography>
      ) : null}

      <Pressable
        onPress={() => setShowPicker(true)}
        accessibilityLabel={`Time: ${formatDisplay(value)}`}
        accessibilityRole="button"
        accessibilityHint="Tap to change time"
        className="flex-row items-center justify-between bg-surface-100 rounded-xl py-4 px-4"
      >
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={22} color="#737373" />
          <Typography variant="h3" className="text-surface-900 ml-3">
            {formatDisplay(value)}
          </Typography>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#A3A3A3" />
      </Pressable>

      {showPicker ? (
        <DateTimePicker
          value={parseTime(value)}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      ) : null}

      {Platform.OS === 'ios' && showPicker ? (
        <View className="mt-2">
          <Pressable onPress={() => setShowPicker(false)} className="py-2">
            <Typography variant="body" className="text-primary-600 text-center font-semibold">
              Done
            </Typography>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

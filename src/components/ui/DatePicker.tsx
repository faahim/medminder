import { View, Pressable, Platform } from 'react-native';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Typography } from './Typography';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

export function DatePicker({ 
  value, 
  onChange, 
  label,
  minimumDate,
  maximumDate,
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (_: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View>
      {label && (
        <Typography variant="label" className="text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </Typography>
      )}
      
      <Pressable
        onPress={() => setShowPicker(true)}
        accessibilityLabel={`Date: ${format(value, 'MMMM d, yyyy')}`}
        accessibilityRole="button"
        accessibilityHint="Tap to change date"
        className="flex-row items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-xl py-4 px-4"
      >
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={24} color="#6B7280" />
          <Typography variant="h3" className="text-gray-900 dark:text-white ml-3">
            {format(value, 'MMM d, yyyy')}
          </Typography>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {/* iOS: Show inline picker */}
      {Platform.OS === 'ios' && showPicker && (
        <View className="mt-2">
          <Pressable
            onPress={() => setShowPicker(false)}
            className="py-2"
          >
            <Typography variant="body" className="text-primary-500 text-center font-semibold">
              Done
            </Typography>
          </Pressable>
        </View>
      )}
    </View>
  );
}

import { View, Pressable, Modal, FlatList } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';

export interface SelectOption<T = string | number> {
  label: string;
  value: T;
}

interface SelectProps<T = string | number> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  size?: 'md' | 'lg';
  compact?: boolean;
  disabled?: boolean;
}

export function Select<T extends string | number>({
  value,
  options,
  onChange,
  placeholder = 'Select...',
  size = 'md',
  compact = false,
  disabled = false,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  const sizeClass = size === 'lg' ? 'py-4 px-4' : 'py-3 px-3';
  const compactClass = compact ? 'py-2 px-3' : sizeClass;

  return (
    <>
      <Pressable
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        accessibilityLabel={selectedOption?.label || placeholder}
        accessibilityRole="combobox"
        accessibilityState={{ expanded: isOpen, disabled }}
        className={`
          flex-row items-center justify-between
          bg-surface-100 
          rounded-xl
          ${compactClass}
          ${disabled ? 'opacity-50' : ''}
        `}
      >
        <Typography 
          variant="body" 
          className={selectedOption ? 'text-surface-900' : 'text-surface-400'}
        >
          {selectedOption?.label || placeholder}
        </Typography>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable 
          onPress={() => setIsOpen(false)}
          className="flex-1 bg-black/50 justify-end"
        >
          <View className="bg-white rounded-t-3xl max-h-96">
            <View className="p-4 border-b border-surface-100">
              <Typography variant="h3" className="text-surface-900 text-center">
                Select Option
              </Typography>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item.value);
                    setIsOpen(false);
                  }}
                  className={`
                    p-4 flex-row items-center justify-between
                    ${item.value === value ? 'bg-primary-50' : ''}
                  `}
                >
                  <Typography 
                    variant="body" 
                    className={item.value === value 
                      ? 'text-primary-600 font-semibold' 
                      : 'text-surface-900'
                    }
                  >
                    {item.label}
                  </Typography>
                  {item.value === value && (
                    <Ionicons name="checkmark" size={24} color="#06B6D4" />
                  )}
                </Pressable>
              )}
            />
            <View className="p-4 pb-8">
              <Pressable
                onPress={() => setIsOpen(false)}
                className="py-4 bg-surface-100 rounded-xl"
              >
                <Typography variant="body" className="text-surface-900 text-center font-semibold">
                  Cancel
                </Typography>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

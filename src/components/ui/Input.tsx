import { TextInput, View, TextInputProps } from 'react-native';
import { Typography } from './Typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  size?: 'md' | 'lg';
}

export function Input({
  label,
  error,
  size = 'md',
  className = '',
  ...props
}: InputProps) {
  const sizeClass = size === 'lg' ? 'py-4 px-4 text-xl' : 'py-3 px-3 text-lg';

  return (
    <View>
      {label && (
        <Typography variant="label" className="text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </Typography>
      )}
      <TextInput
        className={`
          bg-gray-100 dark:bg-gray-700 
          rounded-xl 
          text-gray-900 dark:text-white
          ${sizeClass}
          ${error ? 'border-2 border-red-500' : ''}
          ${className}
        `}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && (
        <Typography variant="small" className="text-red-500 mt-1">
          {error}
        </Typography>
      )}
    </View>
  );
}

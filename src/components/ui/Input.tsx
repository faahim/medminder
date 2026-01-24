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
  const sizeClass = size === 'lg'
    ? 'py-4 px-4 text-lg'
    : 'py-3.5 px-4 text-base';

  return (
    <View>
      {label && (
        <Typography variant="label" className="text-surface-600 mb-2 uppercase tracking-wider text-xs">
          {label}
        </Typography>
      )}
      <TextInput
        className={`
          bg-surface-100
          border-2 border-transparent
          rounded-xl
          text-surface-900
          ${sizeClass}
          ${error ? 'border-danger-500' : 'focus:border-primary-500'}
          ${className}
        `}
        placeholderTextColor="#A3A3A3"
        {...props}
      />
      {error && (
        <Typography variant="small" className="text-danger-500 mt-1.5">
          {error}
        </Typography>
      )}
    </View>
  );
}

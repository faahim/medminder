import * as React from 'react';
import { TextInput, View, TextInputProps, ViewStyle } from 'react-native';
import { colors, radii, spacing, typography } from '../../design/tokens';
import { Typography } from './Typography';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  size?: 'md' | 'lg';
  /** Kept for NativeWind compatibility across existing screens */
  className?: string;
  containerStyle?: ViewStyle | ViewStyle[];
}

export function Input({
  label,
  error,
  size = 'md',
  className = '',
  containerStyle,
  onFocus,
  onBlur,
  style,
  ...props
}: InputProps) {
  const [focused, setFocused] = React.useState(false);

  const height = size === 'lg' ? 52 : 44;
  const fontSize = size === 'lg' ? typography.body.fontSize : typography.label.fontSize;

  const borderColor = error
    ? colors.error[500]
    : focused
      ? colors.primary[500]
      : colors.surface[200];

  return (
    <View style={containerStyle}>
      {label ? (
        <Typography variant="label" style={{ marginBottom: spacing.sm }}>
          {label}
        </Typography>
      ) : null}

      <TextInput
        {...props}
        className={className}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        placeholderTextColor={colors.surface[300]}
        style={[
          {
            minHeight: height,
            paddingHorizontal: spacing.md,
            paddingVertical: 10,
            borderRadius: radii.md,
            backgroundColor: colors.surface[100],
            borderWidth: 1,
            borderColor,
            color: colors.surface[900],
            fontSize,
          },
          style as any,
        ]}
      />

      {error ? (
        <Typography variant="small" style={{ marginTop: spacing.xs, color: colors.error[500] }}>
          {error}
        </Typography>
      ) : null}
    </View>
  );
}

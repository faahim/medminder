import * as React from 'react';
import { View, TextInput, TextInputProps, ViewStyle, Pressable } from 'react-native';
import { colors, radii, spacing, iconSizes } from '../../design/tokens';
import { Icon } from './Icon';
import { Typography } from './Typography';

export interface SearchInputProps extends TextInputProps {
  /** Optional label above the search input */
  label?: string;
  /** Placeholder text (default: "Search...") */
  placeholder?: string;
  /** Kept for NativeWind compatibility across existing screens */
  className?: string;
  containerStyle?: ViewStyle | ViewStyle[];
}

export function SearchInput({
  label,
  placeholder = 'Search...',
  className = '',
  containerStyle,
  onFocus,
  onBlur,
  style,
  value,
  onChangeText,
  ...props
}: SearchInputProps) {
  const [focused, setFocused] = React.useState(false);

  const borderColor = focused ? colors.primary[500] : colors.surface[200];
  const bgColor = focused ? colors.white : colors.surface[100];

  return (
    <View style={containerStyle}>
      {label ? (
        <Typography variant="label" style={{ marginBottom: spacing.sm }}>
          {label}
        </Typography>
      ) : null}

      <View
        className="flex-row items-center"
        style={{
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: radii.lg,
          backgroundColor: bgColor,
          borderWidth: 1,
          borderColor,
        }}
      >
        <Icon
          name="magnifyingglass"
          fallback="search-outline"
          size="md"
          color={focused ? colors.primary[500] : colors.surface[300]}
        />

        <TextInput
          {...props}
          className={className}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.surface[300]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            {
              flex: 1,
              marginLeft: spacing.sm,
              fontSize: 16,
              color: colors.surface[900],
            },
            style as any,
          ]}
        />

        {value && value.length > 0 && (
          <Pressable
            onPress={() => onChangeText?.('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon
              name="xmark.circle.fill"
              fallback="close-circle"
              size="md"
              color={colors.surface[300]}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

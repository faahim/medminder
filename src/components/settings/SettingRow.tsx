import React from 'react';
import { View, Pressable, Switch, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SymbolView, type SFSymbol } from 'expo-symbols';

import { Typography } from '../ui/Typography';
import { Icon } from '../ui/Icon';
import { colors, radii, spacing } from '../../design/tokens';
import { triggerHaptic } from '../../utils/haptics';

export interface SettingRowProps {
  /** SF Symbol name for the icon */
  icon: SFSymbol;
  /** Ionicons fallback for Android/Web */
  iconFallback?: keyof typeof Ionicons.glyphMap;
  /** Background color for icon container */
  iconBg?: string;
  /** Icon color */
  iconColor?: string;
  /** Title text */
  title: string;
  /** Optional subtitle text */
  subtitle?: string;
  /** Optional value text to display */
  value?: string;
  /** Optional React node to display on the right (e.g., Switch, Select) */
  right?: React.ReactNode;
  /** Whether this is a pressable row (drill-down) */
  pressable?: boolean;
  /** Press handler */
  onPress?: () => void;
  /** Whether this is a destructive action */
  destructive?: boolean;
  /** Whether to show a chevron indicator */
  showChevron?: boolean;
  /** Whether to show a bottom border */
  showBorder?: boolean;
  /** Custom container style */
  style?: ViewStyle;
  /** Haptic feedback type */
  hapticType?: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';
  /** Enable haptic feedback on press */
  enableHaptic?: boolean;
  /** Optional children for nested content */
  children?: React.ReactNode;
}

export function SettingRow({
  icon,
  iconFallback,
  iconBg = colors.surface[100],
  iconColor = colors.surface[700],
  title,
  subtitle,
  value,
  right,
  pressable = false,
  onPress,
  destructive = false,
  showChevron = false,
  showBorder = true,
  style,
  hapticType = 'selection',
  enableHaptic = true,
  children,
}: SettingRowProps) {
  const handlePress = () => {
    if (enableHaptic) {
      triggerHaptic(hapticType);
    }
    onPress?.();
  };

  // If this is a hidden wrapper (for nested Switch component), don't render anything
  if (title === '' && children) {
    return <>{children}</>;
  }

  const content = (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          borderBottomWidth: showBorder ? 1 : 0,
          borderBottomColor: destructive ? colors.error[100] : colors.surface[200],
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: spacing.sm }}>
        {/* Icon Container */}
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: radii.md,
            backgroundColor: destructive ? colors.error[50] : iconBg,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing.md,
          }}
        >
          <Icon
            name={icon}
            fallback={iconFallback}
            size="sm"
            color={destructive ? colors.error[600] : iconColor}
          />
        </View>

        {/* Title and Subtitle */}
        <View style={{ flex: 1 }}>
          <Typography
            variant="body"
            style={{
              color: destructive ? colors.error[600] : colors.surface[900],
              fontWeight: '500',
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="small" style={{ color: colors.surface[500], marginTop: 2 }}>
              {subtitle}
            </Typography>
          )}
        </View>
      </View>

      {/* Right side content */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        {value && !right && (
          <Typography variant="body" style={{ color: colors.surface[500] }}>
            {value}
          </Typography>
        )}
        {right}
        {showChevron && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={destructive ? colors.error[400] : colors.surface[300]}
          />
        )}
      </View>
    </View>
  );

  if (pressable) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

/**
 * SettingRowWithSwitch - A convenience component for rows with toggle switches
 */
export interface SettingRowWithSwitchProps extends Omit<SettingRowProps, 'right' | 'pressable' | 'value'> {
  /** Current switch value */
  switchValue: boolean;
  /** Callback when switch is toggled */
  onValueChange: (value: boolean) => void;
  /** Track color when switch is off */
  trackColorOff?: string;
  /** Track color when switch is on */
  trackColorOn?: string;
  /** Thumb color when switch is on */
  thumbColorOn?: string;
}

export function SettingRowWithSwitch({
  switchValue,
  onValueChange,
  trackColorOff = colors.surface[200],
  trackColorOn = colors.primary[400] + '80', // 50% opacity
  thumbColorOn = colors.primary[500],
  enableHaptic = true,
  hapticType = 'light',
  ...props
}: SettingRowWithSwitchProps) {
  const handleValueChange = (newValue: boolean) => {
    if (enableHaptic) {
      triggerHaptic(hapticType);
    }
    onValueChange(newValue);
  };

  return (
    <SettingRow
      {...props}
      right={
        <Switch
          value={switchValue}
          onValueChange={handleValueChange}
          trackColor={{ false: trackColorOff, true: trackColorOn }}
          thumbColor={switchValue ? thumbColorOn : colors.surface[100]}
          ios_backgroundColor={trackColorOff}
        />
      }
    />
  );
}

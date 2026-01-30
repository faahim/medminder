import React from 'react';
import { View, type ViewStyle } from 'react-native';

import { Typography } from '../ui/Typography';
import { colors, radii, spacing } from '../../design/tokens';

export interface SettingSectionProps {
  /** Section title */
  title: string;
  /** Section content (SettingRow components) */
  children: React.ReactNode;
  /** Custom container style */
  style?: ViewStyle;
  /** Background color for the section */
  bgColor?: string;
  /** Border color */
  borderColor?: string;
}

export function SettingSection({
  title,
  children,
  style,
  bgColor = '#FFFFFF',
  borderColor = colors.surface[100],
}: SettingSectionProps) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      {/* Section Header */}
      <Typography
        variant="label"
        style={{
          color: colors.surface[500],
          marginLeft: spacing.md + 12, // align with row content (icon padding)
          marginBottom: spacing.sm,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          fontSize: 13,
        }}
      >
        {title}
      </Typography>

      {/* Section Card */}
      <View
        style={[
          {
            backgroundColor: bgColor,
            borderRadius: radii.xl,
            borderWidth: 1,
            borderColor: borderColor,
            overflow: 'hidden',
          },
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

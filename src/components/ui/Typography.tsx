import * as React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { colors, typography as typeScale } from '../../design/tokens';

export type TypographyVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'small'
  | 'label'
  | 'button';

export interface TypographyProps extends Omit<TextProps, 'style'> {
  variant?: TypographyVariant;
  children: React.ReactNode;
  /** Kept for NativeWind compatibility across existing screens */
  className?: string;
  style?: TextStyle | TextStyle[];
}

const variantStyle: Record<TypographyVariant, TextStyle> = {
  display: {
    fontSize: typeScale.display.fontSize,
    fontWeight: typeScale.display.fontWeight,
    lineHeight: typeScale.display.fontSize * typeScale.display.lineHeight,
    color: colors.surface[900],
  },
  h1: {
    fontSize: typeScale.h1.fontSize,
    fontWeight: typeScale.h1.fontWeight,
    lineHeight: typeScale.h1.fontSize * typeScale.h1.lineHeight,
    color: colors.surface[900],
  },
  h2: {
    fontSize: typeScale.h2.fontSize,
    fontWeight: typeScale.h2.fontWeight,
    lineHeight: typeScale.h2.fontSize * typeScale.h2.lineHeight,
    color: colors.surface[900],
  },
  h3: {
    fontSize: typeScale.h3.fontSize,
    fontWeight: typeScale.h3.fontWeight,
    lineHeight: typeScale.h3.fontSize * typeScale.h3.lineHeight,
    color: colors.surface[900],
  },
  body: {
    fontSize: typeScale.body.fontSize,
    fontWeight: typeScale.body.fontWeight,
    lineHeight: typeScale.body.fontSize * typeScale.body.lineHeight,
    color: colors.surface[700],
  },
  small: {
    fontSize: typeScale.small.fontSize,
    fontWeight: typeScale.small.fontWeight,
    lineHeight: typeScale.small.fontSize * typeScale.small.lineHeight,
    color: colors.surface[500],
  },
  label: {
    fontSize: typeScale.label.fontSize,
    fontWeight: typeScale.label.fontWeight,
    lineHeight: typeScale.label.fontSize * typeScale.label.lineHeight,
    color: colors.surface[500],
    textTransform: 'uppercase',
    letterSpacing: 1.25,
  },
  button: {
    fontSize: typeScale.label.fontSize,
    fontWeight: '600',
    lineHeight: typeScale.label.fontSize * typeScale.label.lineHeight,
    color: colors.surface[900],
  },
};

export function Typography({
  variant = 'body',
  children,
  className = '',
  style,
  ...props
}: TypographyProps) {
  const isHeader = variant === 'display' || variant.startsWith('h');

  return (
    <Text
      {...props}
      className={className}
      style={[variantStyle[variant], style]}
      accessibilityRole={isHeader ? 'header' : 'text'}
    >
      {children}
    </Text>
  );
}

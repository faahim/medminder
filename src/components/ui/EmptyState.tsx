import { View } from 'react-native';
import { Link, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { SFSymbol } from 'expo-symbols';

import { colors, radii, spacing } from '../../design/tokens';

import { Typography } from './Typography';
import { Button } from './Button';
import { Icon } from './Icon';

export interface EmptyStateProps {
  /** Preferred: SF Symbol name (iOS) with Ionicons fallback for other platforms. */
  sfSymbol?: SFSymbol;

  /** Legacy (still supported): Ionicons name. */
  icon?: keyof typeof Ionicons.glyphMap;

  /** Alternative Ionicons fallback (if icon prop is not used) */
  fallbackIcon?: keyof typeof Ionicons.glyphMap;

  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: Href;
  onAction?: () => void;
  /** Icon background color variant */
  variant?: 'primary' | 'surface' | 'success' | 'warning' | 'error';
}

const variantColors = {
  primary: {
    bg: colors.primary[50],
    border: colors.primary[100],
    icon: colors.primary[600],
  },
  surface: {
    bg: colors.surface[100],
    border: colors.surface[200],
    icon: colors.surface[300],
  },
  success: {
    bg: colors.success[50],
    border: colors.success[100],
    icon: colors.success[600],
  },
  warning: {
    bg: colors.warning[50],
    border: colors.warning[100],
    icon: colors.warning[600],
  },
  error: {
    bg: colors.error[50],
    border: colors.error[100],
    icon: colors.error[600],
  },
} as const;

export function EmptyState({
  sfSymbol,
  fallbackIcon,
  icon,
  title,
  subtitle,
  actionLabel,
  actionHref,
  onAction,
  variant = 'surface',
}: EmptyStateProps) {
  const resolvedFallback = fallbackIcon ?? icon ?? 'ellipse';
  const colorsForVariant = variantColors[variant];

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing['2xl'],
        paddingHorizontal: spacing.lg,
      }}
    >
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: radii.xl,
          backgroundColor: colorsForVariant.bg,
          borderWidth: 1,
          borderColor: colorsForVariant.border,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.lg,
        }}
      >
        {sfSymbol ? (
          <Icon
            name={sfSymbol}
            fallback={resolvedFallback}
            size={44}
            color={colorsForVariant.icon}
            weight="semibold"
          />
        ) : (
          <Ionicons name={resolvedFallback} size={44} color={colorsForVariant.icon} />
        )}
      </View>

      <Typography
        variant="h2"
        style={{
          color: colors.surface[900],
          textAlign: 'center',
          marginBottom: spacing.xs,
          fontWeight: '700',
        }}
      >
        {title}
      </Typography>

      {subtitle ? (
        <Typography
          variant="body"
          style={{
            color: colors.surface[500],
            textAlign: 'center',
            marginBottom: spacing.lg,
            maxWidth: 320,
            lineHeight: 22,
          }}
        >
          {subtitle}
        </Typography>
      ) : null}

      {actionLabel && actionHref ? (
        <Link href={actionHref} asChild>
          <Button title={actionLabel} size="lg" onPress={() => {}} />
        </Link>
      ) : null}

      {actionLabel && onAction && !actionHref ? (
        <Button title={actionLabel} size="lg" onPress={onAction} />
      ) : null}
    </View>
  );
}

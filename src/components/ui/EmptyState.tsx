import { View } from 'react-native';
import { Link, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { SFSymbol } from 'expo-symbols';

import { colors, radii, spacing } from '../../design/tokens';

import { Typography } from './Typography';
import { Button } from './Button';
import { Icon } from './Icon';

interface EmptyStateProps {
  /** Preferred: SF Symbol name (iOS) with Ionicons fallback for other platforms. */
  sfSymbol?: SFSymbol;
  fallbackIcon?: keyof typeof Ionicons.glyphMap;

  /** Legacy (still supported): Ionicons name. */
  icon?: keyof typeof Ionicons.glyphMap;

  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: Href;
  onAction?: () => void;
}

export function EmptyState({
  sfSymbol,
  fallbackIcon,
  icon,
  title,
  subtitle,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  const resolvedFallback = fallbackIcon ?? icon ?? 'ellipse';

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 56, paddingHorizontal: 32 }}>
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: radii.xl,
          backgroundColor: colors.primary[50],
          borderWidth: 1,
          borderColor: colors.primary[100],
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.lg,
        }}
      >
        {sfSymbol ? (
          <Icon name={sfSymbol} fallback={resolvedFallback} size={44} color={colors.primary[600]} weight="semibold" />
        ) : (
          <Ionicons name={resolvedFallback} size={44} color={colors.primary[600]} />
        )}
      </View>

      <Typography variant="h2" style={{ color: colors.surface[900], textAlign: 'center', marginBottom: 8, fontWeight: '900' }}>
        {title}
      </Typography>

      {subtitle ? (
        <Typography variant="body" style={{ color: colors.surface[500], textAlign: 'center', marginBottom: spacing.lg, maxWidth: 320 }}>
          {subtitle}
        </Typography>
      ) : null}

      {actionLabel && actionHref ? (
        <Link href={actionHref} asChild>
          <Button title={actionLabel} size="lg" onPress={() => {}} />
        </Link>
      ) : null}

      {actionLabel && onAction && !actionHref ? <Button title={actionLabel} size="lg" onPress={onAction} /> : null}
    </View>
  );
}

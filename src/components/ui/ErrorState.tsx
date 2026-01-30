import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SFSymbol } from 'expo-symbols';

import { colors, radii, spacing } from '../../design/tokens';

import { Typography } from './Typography';
import { Button } from './Button';
import { Icon } from './Icon';

export interface ErrorStateProps {
  /** SF Symbol name for the error icon (default: exclamationmark.triangle) */
  sfSymbol?: SFSymbol;
  /** Fallback Ionicons name (default: warning) */
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
  title?: string;
  message?: string;
  /** Error message details (shown in DEV mode) */
  error?: Error | string;
  /** Retry callback */
  onRetry?: () => void;
  /** Dismiss callback */
  onDismiss?: () => void;
  /** Whether to show detailed error info */
  showDetails?: boolean;
}

const DEFAULT_SF_SYMBOL: SFSymbol = 'exclamationmark.triangle';

export function ErrorState({
  sfSymbol = DEFAULT_SF_SYMBOL,
  fallbackIcon = 'warning-outline',
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  error,
  onRetry,
  onDismiss,
  showDetails = false,
}: ErrorStateProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message;

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing['2xl'],
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.surface[50],
      }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: radii.xl,
          backgroundColor: colors.error[50],
          borderWidth: 1,
          borderColor: colors.error[100],
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.lg,
        }}
      >
        <Icon
          name={sfSymbol}
          fallback={fallbackIcon}
          size={36}
          color={colors.error[500]}
          weight="semibold"
        />
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

      {message ? (
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
          {message}
        </Typography>
      ) : null}

      {(onRetry || onDismiss) && (
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.md,
            width: '100%',
            maxWidth: 320,
          }}
        >
          {onRetry && (
            <Button
              title="Try Again"
              size="lg"
              onPress={onRetry}
              style={{ flex: 1 }}
            />
          )}
          {onDismiss && (
            <Button
              title="Dismiss"
              size="lg"
              variant="secondary"
              onPress={onDismiss}
              style={{ flex: 1 }}
            />
          )}
        </View>
      )}

      {showDetails && errorMessage && (
        <View
          style={{
            marginTop: spacing.lg,
            padding: spacing.md,
            backgroundColor: colors.error[50],
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: colors.error[100],
            width: '100%',
            maxWidth: 320,
          }}
        >
          <Typography
            variant="small"
            style={{
              color: colors.error[600],
              fontFamily: 'monospace',
            }}
          >
            {errorMessage}
          </Typography>
        </View>
      )}
    </View>
  );
}

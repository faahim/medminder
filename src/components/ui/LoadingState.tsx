import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SFSymbol } from 'expo-symbols';

import { colors, radii, spacing } from '../../design/tokens';

import { Typography } from './Typography';
import { Icon } from './Icon';

export interface LoadingStateProps {
  /** Optional custom message */
  message?: string;
  /** SF Symbol name for a decorative icon (optional) */
  sfSymbol?: SFSymbol;
  /** Fallback Ionicons name (optional) */
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
  /** Size of the loading indicator */
  size?: 'small' | 'large';
  /** Color variant */
  variant?: 'primary' | 'surface';
}

export function LoadingState({
  message,
  sfSymbol,
  fallbackIcon,
  size = 'large',
  variant = 'primary',
}: LoadingStateProps) {
  const indicatorColor = variant === 'primary' ? colors.primary[500] : colors.surface[300];

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
      {sfSymbol ? (
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: radii.xl,
            backgroundColor: variant === 'primary' ? colors.primary[50] : colors.surface[100],
            borderWidth: 1,
            borderColor: variant === 'primary' ? colors.primary[100] : colors.surface[200],
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.lg,
          }}
        >
          <Icon
            name={sfSymbol}
            fallback={fallbackIcon || 'ellipse'}
            size={36}
            color={indicatorColor}
            weight="regular"
          />
        </View>
      ) : (
        <View style={{ marginBottom: spacing.lg }}>
          <ActivityIndicator size={size} color={indicatorColor} />
        </View>
      )}

      {message && (
        <Typography
          variant="body"
          style={{
            color: colors.surface[500],
            textAlign: 'center',
            maxWidth: 320,
            lineHeight: 22,
          }}
        >
          {message}
        </Typography>
      )}
    </View>
  );
}

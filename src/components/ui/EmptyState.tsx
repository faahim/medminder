import { View } from 'react-native';
import { Link, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';
import { Button } from './Button';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: Href;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-8">
      <View className="w-24 h-24 rounded-2xl bg-primary-50 dark:bg-primary-950 items-center justify-center mb-6">
        <Ionicons name={icon} size={44} color="#06B6D4" />
      </View>

      <Typography variant="h2" className="text-surface-900 dark:text-white text-center mb-2">
        {title}
      </Typography>

      {subtitle && (
        <Typography variant="body" className="text-surface-500 dark:text-surface-400 text-center mb-6 max-w-xs">
          {subtitle}
        </Typography>
      )}

      {actionLabel && actionHref && (
        <Link href={actionHref} asChild>
          <Button title={actionLabel} size="lg" onPress={() => {}} />
        </Link>
      )}

      {actionLabel && onAction && !actionHref && (
        <Button title={actionLabel} size="lg" onPress={onAction} />
      )}
    </View>
  );
}

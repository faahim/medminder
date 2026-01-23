import { View } from 'react-native';
import { Typography } from './Typography';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
}

export function ProgressBar({ current, total, showLabel = false }: ProgressBarProps) {
  const progress = (current / total) * 100;

  return (
    <View className="px-6 py-4 bg-white dark:bg-surface-900 border-b border-surface-100 dark:border-surface-800">
      {showLabel && (
        <Typography variant="small" className="text-surface-500 dark:text-surface-400 mb-2 text-center">
          Step {current} of {total}
        </Typography>
      )}
      <View className="flex-row items-center gap-2">
        {Array.from({ length: total }).map((_, index) => (
          <View
            key={index}
            className={`flex-1 h-1.5 rounded-full ${
              index < current
                ? 'bg-primary-500'
                : index === current
                ? 'bg-primary-200 dark:bg-primary-800'
                : 'bg-surface-200 dark:bg-surface-700'
            }`}
          />
        ))}
      </View>
    </View>
  );
}

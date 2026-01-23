import { View } from 'react-native';
import { Typography } from './Typography';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
}

export function ProgressBar({ current, total, showLabel = true }: ProgressBarProps) {
  const progress = (current / total) * 100;

  return (
    <View className="px-6 py-4 bg-white dark:bg-gray-800">
      {showLabel && (
        <Typography variant="small" className="text-gray-500 dark:text-gray-400 mb-2 text-center">
          Step {current} of {total}
        </Typography>
      )}
      <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <View
          className="h-full bg-primary-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </View>
    </View>
  );
}

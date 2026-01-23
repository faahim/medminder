import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui/Typography';
import { DoseStatus } from '../../types';

interface StatusIndicatorProps {
  status: DoseStatus;
  showLabel?: boolean;
}

const statusConfig: Record<DoseStatus, { color: string; icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  pending: { color: '#6B7280', icon: 'time-outline', label: 'Pending' },
  taken: { color: '#22C55E', icon: 'checkmark-circle', label: 'Taken' },
  missed: { color: '#EF4444', icon: 'close-circle', label: 'Missed' },
  skipped: { color: '#6B7280', icon: 'remove-circle-outline', label: 'Skipped' },
};

export function StatusIndicator({ status, showLabel = false }: StatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <View className="flex-row items-center">
      <Ionicons name={config.icon} size={20} color={config.color} />
      {showLabel && (
        <Typography
          variant="small"
          className="ml-1 font-medium"
          style={{ color: config.color }}
        >
          {config.label}
        </Typography>
      )}
    </View>
  );
}

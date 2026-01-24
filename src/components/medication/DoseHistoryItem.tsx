import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui/Typography';
import { StatusIndicator } from './StatusIndicator';
import { DoseLog, Medication } from '../../types';

interface DoseHistoryItemProps {
  log: DoseLog;
  medication?: Medication;
}

export function DoseHistoryItem({ log, medication }: DoseHistoryItemProps) {
  const formatTime = (timeStr: string): string => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  return (
    <View className="flex-row items-center justify-between py-3 border-b border-surface-100 last:border-b-0">
      <View className="flex-1">
        <Typography variant="body" className="text-surface-900 font-medium">
          {medication?.name || 'Unknown medication'}
        </Typography>
        <Typography variant="small" className="text-surface-500">
          {formatDate(log.scheduledDate)} at {formatTime(log.scheduledTime)}
        </Typography>
      </View>
      <StatusIndicator status={log.status} showLabel />
    </View>
  );
}

import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui/Typography';
import { DoseCard } from './DoseCard';
import { ScheduledDose, TimeOfDay } from '../../types';

interface TimelineSectionProps {
  title: string;
  icon: 'sunny' | 'partly-sunny' | 'cloudy' | 'moon';
  doses: ScheduledDose[];
  timeOfDay: TimeOfDay;
}

const iconMap: Record<TimeOfDay, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  morning: { name: 'sunny', color: '#F59E0B' },
  afternoon: { name: 'partly-sunny', color: '#F97316' },
  evening: { name: 'cloudy', color: '#8B5CF6' },
  night: { name: 'moon', color: '#6366F1' },
};

export function TimelineSection({ title, doses, timeOfDay }: TimelineSectionProps) {
  const icon = iconMap[timeOfDay];

  if (doses.length === 0) {
    return (
      <View className="mb-6">
        <View className="flex-row items-center mb-3">
          <Ionicons name={icon.name} size={24} color={icon.color} />
          <Typography variant="h3" className="text-surface-700 ml-2">
            {title}
          </Typography>
        </View>
        <Typography variant="body" className="text-surface-400 italic ml-8">
          No medications scheduled
        </Typography>
      </View>
    );
  }

  // Group by time
  const byTime = doses.reduce((acc, dose) => {
    const key = dose.scheduledTime;
    if (!acc[key]) acc[key] = [];
    acc[key].push(dose);
    return acc;
  }, {} as Record<string, ScheduledDose[]>);

  return (
    <View className="mb-6">
      {/* Section Header */}
      <View className="flex-row items-center mb-3">
        <Ionicons name={icon.name} size={24} color={icon.color} />
        <Typography variant="h3" className="text-surface-700 ml-2">
          {title}
        </Typography>
      </View>

      {/* Timeline */}
      <View className="ml-3 pl-5 border-l-2 border-surface-200">
        {Object.entries(byTime).map(([time, timeDoses]) => (
          <View key={time} className="mb-4">
            {/* Time Badge */}
            <View className="flex-row items-center mb-2 -ml-7">
              <View className="w-4 h-4 rounded-full bg-primary-500 mr-3" />
              <Typography variant="body" className="text-surface-600 font-semibold">
                {formatTime(time)}
              </Typography>
            </View>

            {/* Dose Cards */}
            <View className="gap-3">
              {timeDoses.map((dose) => (
                <DoseCard
                  key={`${dose.medication.id}-${dose.scheduledTime}`}
                  dose={dose}
                  onStatusChange={(status) => {
                    // Will trigger re-render via parent state update
                  }}
                />
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

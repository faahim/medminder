import { View } from 'react-native';
import { format, parseISO, isToday } from 'date-fns';
import { colors, spacing, radii } from '../../design/tokens';
import { Typography } from '../ui/Typography';
import { Icon } from '../ui/Icon';
import { Medication, DoseLog } from '../../types';

interface MedicationStatsProps {
  medication: Medication;
  recentLogs: DoseLog[];
}

export function MedicationStats({ medication, recentLogs }: MedicationStatsProps) {
  // Calculate statistics
  const calculateStats = () => {
    const totalDoses = recentLogs.length;
    const takenDoses = recentLogs.filter(log => log.status === 'taken').length;
    const missedDoses = recentLogs.filter(log => log.status === 'missed').length;

    const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

    // Find last taken dose
    const lastTaken = recentLogs.find(log => log.status === 'taken');
    let lastTakenText = 'Not taken yet';
    if (lastTaken) {
      const scheduledDate = parseISO(lastTaken.scheduledDate);
      if (isToday(scheduledDate)) {
        lastTakenText = `Today, ${format(scheduledDate, 'h:mm a')}`;
      } else {
        lastTakenText = format(scheduledDate, 'MMM d, h:mm a');
      }
    }

    // Determine status
    let status: 'active' | 'paused';
    if (medication.endDate) {
      const endDate = parseISO(medication.endDate);
      status = isToday(endDate) || endDate < new Date() ? 'paused' : 'active';
    } else {
      status = medication.isActive ? 'active' : 'paused';
    }

    return {
      dosesTaken: takenDoses,
      adherenceRate,
      lastTakenText,
      status,
    };
  };

  const stats = calculateStats();

  return (
    <View className="bg-white rounded-3xl border border-surface-100 p-5">
      {/* Status Badge */}
      <View className="mb-4">
        <View
          className="self-start flex-row items-center px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: stats.status === 'active' ? colors.success[50] : colors.surface[100],
          }}
        >
          <View
            className="w-2 h-2 rounded-full mr-2"
            style={{
              backgroundColor: stats.status === 'active' ? colors.success[500] : colors.surface[500],
            }}
          />
          <Typography
            variant="small"
            className="uppercase tracking-wider font-semibold"
            style={{
              color: stats.status === 'active' ? colors.success[700] : colors.surface[700],
            }}
          >
            {stats.status === 'active' ? 'Active' : 'Paused'}
          </Typography>
        </View>
      </View>

      {/* Doses Taken */}
      <View className="mb-4">
        <Typography variant="h2" style={{ color: colors.surface[900] }}>
          {stats.dosesTaken}
        </Typography>
        <Typography variant="label" style={{ color: colors.surface[500] }}>
          Doses taken
        </Typography>
      </View>

      {/* Adherence Rate */}
      <View className="mb-4">
        <Typography variant="h2" style={{ color: colors.surface[900] }}>
          {stats.adherenceRate}%
        </Typography>
        <Typography variant="label" style={{ color: colors.surface[500] }}>
          Adherence rate
        </Typography>

        {/* Progress bar */}
        <View
          className="h-2 rounded-full mt-2 overflow-hidden"
          style={{ backgroundColor: colors.surface[100] }}
        >
          <View
            className="h-full rounded-full"
            style={{
              width: `${stats.adherenceRate}%`,
              backgroundColor: stats.adherenceRate >= 80 ? colors.success[500] : colors.warning[500],
              minWidth: 4,
            }}
          />
        </View>
      </View>

      {/* Last Taken */}
      <View className="flex-row items-center">
        <View
          className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
          style={{ backgroundColor: colors.primary[50] }}
        >
          <Icon name="clock" fallback="time-outline" size={20} color={colors.primary[600]} />
        </View>
        <View className="flex-1">
          <Typography variant="label" className="text-surface-500 mb-0.5">
            Last taken
          </Typography>
          <Typography variant="body" style={{ color: colors.surface[900] }}>
            {stats.lastTakenText}
          </Typography>
        </View>
      </View>
    </View>
  );
}

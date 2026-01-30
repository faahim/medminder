import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { DoseLog, Medication, DoseStatus } from '../../types';
import { colors, spacing, radii, iconSizes } from '../../design/tokens';
import { Typography } from '../ui/Typography';
import { Icon } from '../ui/Icon';
import { Badge } from '../ui/Badge';

export interface DoseHistoryItemProps {
  doseLog: DoseLog & { medication?: Medication };
  isLast?: boolean;
}

const STATUS_CONFIG: Record<DoseStatus, { label: string; icon: string; variant: 'success' | 'warning' | 'error' | 'default' }> = {
  taken: { label: 'Taken', icon: 'checkmark.circle.fill', variant: 'success' },
  missed: { label: 'Missed', icon: 'xmark.circle.fill', variant: 'error' },
  skipped: { label: 'Skipped', icon: 'minus.circle.fill', variant: 'default' },
  pending: { label: 'Pending', icon: 'clock', variant: 'warning' },
};

export function DoseHistoryItem({ doseLog, isLast = false }: DoseHistoryItemProps) {
  const { medication, status, scheduledTime, loggedAt } = doseLog;
  const config = STATUS_CONFIG[status];

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getLoggedTimeLabel = () => {
    if (!loggedAt) return null;
    const loggedDate = new Date(loggedAt);
    const hours = loggedDate.getHours();
    const minutes = loggedDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const minsStr = minutes.toString().padStart(2, '0');
    return `${hour12}:${minsStr} ${ampm}`;
  };

  return (
    <View style={[styles.container, !isLast && styles.borderBottom]}>
      {/* Medication Icon */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: medication?.color || colors.primary[500] },
        ]}
      >
        <Icon name="pills.fill" fallback="medkit" size="sm" color={colors.white} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Typography variant="body" style={styles.medicationName}>
            {medication?.name || 'Unknown medication'}
          </Typography>
          <Badge
            label={config.label}
            variant={config.variant}
            left={<Icon name={config.icon as any} fallback="ellipse" size="sm" color={colors.surface[700]} />}
          />
        </View>

        <View style={styles.detailsRow}>
          <Typography variant="small" style={styles.detailText}>
            {medication?.dosage || ''} {medication?.dosageUnit || ''}
          </Typography>
          <Typography variant="small" style={styles.separator}>
            •
          </Typography>
          <Typography variant="small" style={styles.detailText}>
            Scheduled {formatTime(scheduledTime)}
          </Typography>
          {loggedAt && (
            <>
              <Typography variant="small" style={styles.separator}>
                •
              </Typography>
              <Typography variant="small" style={styles.detailText}>
                Logged {getLoggedTimeLabel()}
              </Typography>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surface[200],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  medicationName: {
    fontWeight: '600',
    color: colors.surface[900],
    flex: 1,
    marginRight: spacing.sm,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  detailText: {
    color: colors.surface[500],
  },
  separator: {
    color: colors.surface[300],
    marginHorizontal: spacing.sm,
  },
});

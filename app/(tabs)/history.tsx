import { View } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Calendar, DateData } from 'react-native-calendars';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

import { DoseLogService } from '../../src/services/doseLog.service';
import { MedicationService } from '../../src/services/medication.service';
import { DayAggregate, DoseLog, Medication } from '../../src/types';
import { Typography } from '../../src/components/ui/Typography';
import { StatusIndicator } from '../../src/components/medication/StatusIndicator';
import { AppHeader } from '../../src/components/layout/AppHeader';
import { Screen } from '../../src/components/layout/Screen';

const CALENDAR_THEME = {
  backgroundColor: 'transparent',
  calendarBackground: 'transparent',
  textSectionTitleColor: '#737373',
  selectedDayBackgroundColor: '#06B6D4',
  selectedDayTextColor: '#ffffff',
  todayTextColor: '#06B6D4',
  dayTextColor: '#171717',
  textDisabledColor: '#D4D4D4',
  arrowColor: '#06B6D4',
  monthTextColor: '#171717',
  textDayFontSize: 16,
  textMonthFontSize: 18,
  textDayHeaderFontSize: 14,
};

export default function HistoryScreen() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [dayLogs, setDayLogs] = useState<(DoseLog & { medication?: Medication })[]>([]);
  const [dayAggregate, setDayAggregate] = useState<DayAggregate | null>(null);
  const [medications, setMedications] = useState<Map<string, Medication>>(new Map());

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMonthData = useCallback(
    async (month: DateData) => {
      const start = startOfMonth(new Date(month.year, month.month - 1));
      const end = endOfMonth(start);

      const aggregates = await DoseLogService.getAggregatesForRange(
        format(start, 'yyyy-MM-dd'),
        format(end, 'yyyy-MM-dd')
      );

      const marks: Record<string, any> = {};
      for (const agg of aggregates) {
        let dotColor = '#22C55E';
        if (agg.missedCount > 0 && agg.takenCount > 0) dotColor = '#F59E0B';
        if (agg.missedCount > 0 && agg.takenCount === 0) dotColor = '#EF4444';

        marks[agg.date] = {
          marked: true,
          dotColor,
          selected: agg.date === selectedDate,
          selectedColor: agg.date === selectedDate ? '#06B6D4' : undefined,
        };
      }

      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: '#06B6D4',
      };

      setMarkedDates(marks);
    },
    [selectedDate]
  );

  useEffect(() => {
    loadDayDetails(selectedDate);
  }, [selectedDate, medications]);

  const loadMedications = async () => {
    const meds = await MedicationService.getAll();
    const map = new Map<string, Medication>();
    for (const med of meds) map.set(med.id, med);
    setMedications(map);
  };

  const loadDayDetails = async (date: string) => {
    const logs = await DoseLogService.getDosesForDate(date);
    const aggregate = await DoseLogService.getDayAggregate(date);

    const enrichedLogs = logs.map((log) => ({
      ...log,
      medication: medications.get(log.medicationId),
    }));

    setDayLogs(enrichedLogs);
    setDayAggregate(aggregate);
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  return (
    <View className="flex-1 bg-surface-50">
      <AppHeader title="History" subtitle="Insights" />

      <Screen scroll includeTopInset={false} padX={16} padY={16} padBottomExtra={100}>
        {/* Calendar Card */}
        <View className="bg-white rounded-3xl border border-surface-100 overflow-hidden">
          <View className="px-2 pt-2 pb-1">
            <Calendar
              current={selectedDate}
              onDayPress={handleDayPress}
              onMonthChange={loadMonthData}
              markedDates={markedDates}
              theme={CALENDAR_THEME}
              enableSwipeMonths
            />
          </View>

          {/* Legend */}
          <View className="flex-row justify-center gap-6 py-3 border-t border-surface-100">
            <View className="flex-row items-center">
              <View className="w-2.5 h-2.5 rounded-full bg-success-500 mr-2" />
              <Typography variant="small" className="text-surface-600">
                All taken
              </Typography>
            </View>
            <View className="flex-row items-center">
              <View className="w-2.5 h-2.5 rounded-full bg-warning-500 mr-2" />
              <Typography variant="small" className="text-surface-600">
                Partial
              </Typography>
            </View>
            <View className="flex-row items-center">
              <View className="w-2.5 h-2.5 rounded-full bg-danger-500 mr-2" />
              <Typography variant="small" className="text-surface-600">
                Missed
              </Typography>
            </View>
          </View>
        </View>

        {/* Day Details */}
        <View className="mt-6">
          <Typography variant="h2" className="text-surface-900 mb-1">
            {format(parseISO(selectedDate), 'MMMM d, yyyy')}
          </Typography>

          {dayAggregate && dayAggregate.totalDoses > 0 ? (
            <>
              {/* Adherence */}
              <View className="flex-row items-center mb-4">
                <View className="flex-row items-center bg-success-50 px-3 py-1.5 rounded-xl">
                  <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                  <Typography variant="small" className="text-success-700 ml-1 font-semibold">
                    {dayAggregate.adherencePercent}%
                  </Typography>
                </View>
                <Typography variant="small" className="text-surface-500 ml-2">
                  {dayAggregate.takenCount}/{dayAggregate.takenCount + dayAggregate.missedCount} doses taken
                </Typography>
              </View>

              <View className="bg-white rounded-3xl border border-surface-100 overflow-hidden">
                {dayLogs.map((log, index) => (
                  <View
                    key={log.id}
                    className={`flex-row items-center justify-between p-4 ${
                      index < dayLogs.length - 1 ? 'border-b border-surface-100' : ''
                    }`}
                  >
                    <View className="flex-row items-center flex-1">
                      <View
                        className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                        style={{ backgroundColor: log.medication?.color || '#06B6D4' }}
                      >
                        <Ionicons name="medical" size={18} color="#fff" />
                      </View>
                      <View className="flex-1">
                        <Typography variant="body" className="text-surface-900 font-semibold">
                          {log.medication?.name || 'Unknown medication'}
                        </Typography>
                        <Typography variant="small" className="text-surface-500">
                          Scheduled at {log.scheduledTime}
                        </Typography>
                      </View>
                    </View>
                    <StatusIndicator status={log.status} showLabel />
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View className="items-center py-10">
              <View className="w-16 h-16 rounded-3xl bg-surface-100 items-center justify-center mb-4">
                <Ionicons name="calendar-outline" size={30} color="#737373" />
              </View>
              <Typography variant="body" className="text-surface-500 text-center">
                No doses scheduled for this day
              </Typography>
            </View>
          )}
        </View>
      </Screen>
    </View>
  );
}

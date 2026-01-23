import { View, ScrollView } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Calendar, DateData } from 'react-native-calendars';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { DoseLogService } from '../../src/services/doseLog.service';
import { MedicationService } from '../../src/services/medication.service';
import { DayAggregate, DoseLog, Medication } from '../../src/types';
import { Typography } from '../../src/components/ui/Typography';
import { Card } from '../../src/components/ui/Card';
import { StatusIndicator } from '../../src/components/medication/StatusIndicator';

const CALENDAR_THEME = {
  backgroundColor: 'transparent',
  calendarBackground: 'transparent',
  textSectionTitleColor: '#6B7280',
  selectedDayBackgroundColor: '#4CAF50',
  selectedDayTextColor: '#ffffff',
  todayTextColor: '#4CAF50',
  dayTextColor: '#1F2937',
  textDisabledColor: '#D1D5DB',
  arrowColor: '#4CAF50',
  monthTextColor: '#1F2937',
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

  // Load medications map
  useEffect(() => {
    loadMedications();
  }, []);

  // Load month data when calendar changes
  const loadMonthData = useCallback(async (month: DateData) => {
    const start = startOfMonth(new Date(month.year, month.month - 1));
    const end = endOfMonth(start);
    
    const aggregates = await DoseLogService.getAggregatesForRange(
      format(start, 'yyyy-MM-dd'),
      format(end, 'yyyy-MM-dd')
    );

    const marks: Record<string, any> = {};
    for (const agg of aggregates) {
      let dotColor = '#4CAF50'; // Green - all taken
      if (agg.missedCount > 0 && agg.takenCount > 0) {
        dotColor = '#FFC107'; // Yellow - partial
      } else if (agg.missedCount > 0 && agg.takenCount === 0) {
        dotColor = '#F44336'; // Red - all missed
      }

      marks[agg.date] = {
        marked: true,
        dotColor,
        selected: agg.date === selectedDate,
        selectedColor: agg.date === selectedDate ? '#4CAF50' : undefined,
      };
    }

    // Add selected date marker even if no data
    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: '#4CAF50',
    };

    setMarkedDates(marks);
  }, [selectedDate]);

  // Load selected day's details
  useEffect(() => {
    loadDayDetails(selectedDate);
  }, [selectedDate, medications]);

  const loadMedications = async () => {
    const meds = await MedicationService.getAll();
    const map = new Map<string, Medication>();
    for (const med of meds) {
      map.set(med.id, med);
    }
    setMedications(map);
  };

  const loadDayDetails = async (date: string) => {
    const logs = await DoseLogService.getDosesForDate(date);
    const aggregate = await DoseLogService.getDayAggregate(date);
    
    // Attach medication info to logs
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
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1">
        {/* Calendar */}
        <View className="bg-white dark:bg-gray-800 px-4 pt-4">
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
        <View className="flex-row justify-center gap-6 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
            <Typography variant="small" className="text-gray-600 dark:text-gray-400">
              All taken
            </Typography>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
            <Typography variant="small" className="text-gray-600 dark:text-gray-400">
              Partial
            </Typography>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-red-500 mr-2" />
            <Typography variant="small" className="text-gray-600 dark:text-gray-400">
              Missed
            </Typography>
          </View>
        </View>

        {/* Day Details */}
        <View className="px-4 py-6">
          <Typography variant="h2" className="text-gray-900 dark:text-white mb-1">
            {format(parseISO(selectedDate), 'MMMM d, yyyy')}
          </Typography>
          
          {dayAggregate && dayAggregate.totalDoses > 0 ? (
            <>
              <Typography variant="body" className="text-gray-600 dark:text-gray-300 mb-4">
                Adherence: {dayAggregate.adherencePercent}% ({dayAggregate.takenCount}/{dayAggregate.takenCount + dayAggregate.missedCount} doses)
              </Typography>

              <Card className="p-0 overflow-hidden">
                {dayLogs.map((log, index) => (
                  <View
                    key={log.id}
                    className={`flex-row items-center justify-between p-4 ${
                      index < dayLogs.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                    }`}
                  >
                    <View className="flex-1">
                      <Typography variant="body" className="text-gray-900 dark:text-white font-medium">
                        {log.scheduledTime}
                      </Typography>
                      <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                        {log.medication?.name || 'Unknown medication'}
                      </Typography>
                    </View>
                    <StatusIndicator status={log.status} showLabel />
                  </View>
                ))}
              </Card>
            </>
          ) : (
            <Typography variant="body" className="text-gray-500 dark:text-gray-400 text-center py-8">
              No doses scheduled for this day
            </Typography>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

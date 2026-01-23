import { View, Switch, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useMedicationForm } from '../../src/contexts/MedicationFormContext';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Input } from '../../src/components/ui/Input';

export default function AddMedicationStep4() {
  const { formData, updateFormData } = useMedicationForm();

  return (
    <ScreenWrapper>
      <ProgressBar current={4} total={5} />

      <ScrollView className="flex-1 px-6 py-8">
        <Typography variant="h2" className="text-gray-900 dark:text-white mb-2">
          Duration
        </Typography>
        <Typography variant="body" className="text-gray-500 dark:text-gray-400 mb-8">
          Step 4 of 5: When do you start and stop?
        </Typography>

        {/* Start Date */}
        <View className="mb-8">
          <Typography variant="label" className="text-gray-700 dark:text-gray-300 mb-3">
            Start Date
          </Typography>
          <Input
            value={formData.startDate.toISOString().split('T')[0]}
            onChangeText={(text) => {
              const date = new Date(text);
              if (!isNaN(date.getTime())) {
                updateFormData({ startDate: date });
              }
            }}
            placeholder="YYYY-MM-DD"
            size="lg"
          />
          <Typography variant="small" className="text-gray-500 dark:text-gray-400 mt-2">
            Format: YYYY-MM-DD (e.g., 2025-01-23)
          </Typography>
        </View>

        {/* Has End Date Toggle */}
        <View className="flex-row items-center justify-between mb-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-xl">
          <View>
            <Typography variant="body" className="text-gray-900 dark:text-white font-medium">
              This medication has an end date
            </Typography>
            <Typography variant="small" className="text-gray-500 dark:text-gray-400">
              For temporary prescriptions or courses
            </Typography>
          </View>
          <Switch
            value={formData.hasEndDate}
            onValueChange={(value) => updateFormData({ 
              hasEndDate: value,
              endDate: value ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null
            })}
            trackColor={{ false: '#E0E0E0', true: '#4CAF5080' }}
            thumbColor={formData.hasEndDate ? '#4CAF50' : '#f4f3f4'}
          />
        </View>

        {/* End Date */}
        {formData.hasEndDate && (
          <View className="mb-8">
            <Typography variant="label" className="text-gray-700 dark:text-gray-300 mb-3">
              End Date
            </Typography>
            <Input
              value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''}
              onChangeText={(text) => {
                const date = new Date(text);
                if (!isNaN(date.getTime())) {
                  updateFormData({ endDate: date });
                }
              }}
              placeholder="YYYY-MM-DD"
              size="lg"
            />
            <Typography variant="small" className="text-gray-500 dark:text-gray-400 mt-2">
              Format: YYYY-MM-DD (e.g., 2025-02-23)
            </Typography>
          </View>
        )}

        {/* Quick Duration Buttons */}
        {formData.hasEndDate && (
          <View className="mb-6">
            <Typography variant="label" className="text-gray-700 dark:text-gray-300 mb-3">
              Quick select duration
            </Typography>
            <View className="flex-row flex-wrap gap-2">
              {[7, 14, 21, 30, 60, 90].map((days) => (
                <Button
                  key={days}
                  title={`${days} days`}
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    const endDate = new Date(formData.startDate);
                    endDate.setDate(endDate.getDate() + days);
                    updateFormData({ endDate });
                  }}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View className="px-6 pb-8 flex-row gap-3">
        <Button
          title="Back"
          variant="outline"
          size="xl"
          onPress={() => router.back()}
          className="flex-1"
        />
        <Button
          title="Review"
          size="xl"
          onPress={() => router.push('/medication/confirm')}
          className="flex-1"
        />
      </View>
    </ScreenWrapper>
  );
}

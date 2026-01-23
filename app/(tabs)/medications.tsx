import { View, FlatList, Pressable, Platform } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useMedications } from '../../src/hooks/useMedications';
import { MedicationCard } from '../../src/components/medication/MedicationCard';
import { Typography } from '../../src/components/ui/Typography';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function MedicationsScreen() {
  const [showArchived, setShowArchived] = useState(false);
  const { medications, archivedMedications, isLoading } = useMedications();

  const displayList = showArchived ? archivedMedications : medications;
  const activeCount = medications.length;
  const archivedCount = archivedMedications.length;

  return (
    <View className="flex-1 bg-surface-50 dark:bg-surface-950">
      {/* Header */}
      <View className="bg-white dark:bg-surface-900 px-6 pt-16 pb-4 border-b border-surface-100 dark:border-surface-800">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Typography variant="small" className="text-surface-500 dark:text-surface-400 uppercase tracking-wider">
              Manage
            </Typography>
            <Typography variant="h1" className="text-surface-900 dark:text-white font-bold">
              Medications
            </Typography>
          </View>
          <Pressable
            onPress={() => router.push('/medication/add')}
            className="w-12 h-12 rounded-xl bg-primary-500 items-center justify-center"
            style={{
              shadowColor: '#06B6D4',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </Pressable>
        </View>

        {/* Toggle */}
        <View className="flex-row bg-surface-100 dark:bg-surface-800 rounded-xl p-1">
          <Pressable
            onPress={() => setShowArchived(false)}
            className={`flex-1 flex-row items-center justify-center py-2.5 rounded-lg ${
              !showArchived ? 'bg-white dark:bg-surface-700' : ''
            }`}
            style={!showArchived ? {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            } : {}}
          >
            <Ionicons
              name="medical"
              size={16}
              color={!showArchived ? '#06B6D4' : '#A3A3A3'}
            />
            <Typography
              variant="body"
              className={`ml-2 font-semibold ${
                !showArchived
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-surface-500 dark:text-surface-400'
              }`}
            >
              Active
            </Typography>
            <View className={`ml-2 px-2 py-0.5 rounded-full ${
              !showArchived
                ? 'bg-primary-100 dark:bg-primary-900'
                : 'bg-surface-200 dark:bg-surface-700'
            }`}>
              <Typography
                variant="small"
                className={
                  !showArchived
                    ? 'text-primary-600 dark:text-primary-400 font-bold'
                    : 'text-surface-500 dark:text-surface-400 font-medium'
                }
              >
                {activeCount}
              </Typography>
            </View>
          </Pressable>
          <Pressable
            onPress={() => setShowArchived(true)}
            className={`flex-1 flex-row items-center justify-center py-2.5 rounded-lg ${
              showArchived ? 'bg-white dark:bg-surface-700' : ''
            }`}
            style={showArchived ? {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            } : {}}
          >
            <Ionicons
              name="archive"
              size={16}
              color={showArchived ? '#06B6D4' : '#A3A3A3'}
            />
            <Typography
              variant="body"
              className={`ml-2 font-semibold ${
                showArchived
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-surface-500 dark:text-surface-400'
              }`}
            >
              Archived
            </Typography>
            {archivedCount > 0 && (
              <View className={`ml-2 px-2 py-0.5 rounded-full ${
                showArchived
                  ? 'bg-primary-100 dark:bg-primary-900'
                  : 'bg-surface-200 dark:bg-surface-700'
              }`}>
                <Typography
                  variant="small"
                  className={
                    showArchived
                      ? 'text-primary-600 dark:text-primary-400 font-bold'
                      : 'text-surface-500 dark:text-surface-400 font-medium'
                  }
                >
                  {archivedCount}
                </Typography>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={displayList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: Platform.OS === 'ios' ? 100 : 80,
        }}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/medication/${item.id}`)}>
            <MedicationCard medication={item} allMedications={medications} showChevron />
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={showArchived ? 'archive-outline' : 'medical-outline'}
            title={showArchived ? 'No archived medications' : 'No medications yet'}
            subtitle={showArchived ? 'Archived medications will appear here' : 'Add your first medication to get started'}
            actionLabel={showArchived ? undefined : 'Add Medication'}
            actionHref={showArchived ? undefined : '/medication/add'}
          />
        }
        ItemSeparatorComponent={() => <View className="h-3" />}
      />
    </View>
  );
}

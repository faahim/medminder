import { View, FlatList, Pressable } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useMedications } from '../../src/hooks/useMedications';
import { MedicationCard } from '../../src/components/medication/MedicationCard';
import { Typography } from '../../src/components/ui/Typography';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { AppHeader } from '../../src/components/layout/AppHeader';

export default function MedicationsScreen() {
  const insets = useSafeAreaInsets();
  const [showArchived, setShowArchived] = useState(false);
  const { medications, archivedMedications } = useMedications();

  const displayList = showArchived ? archivedMedications : medications;
  const activeCount = medications.length;
  const archivedCount = archivedMedications.length;

  return (
    <View className="flex-1 bg-surface-50">
      <AppHeader
        title="Medications"
        subtitle="Manage"
        variant="plain"
        right={
          <>
            <Pressable
              onPress={() => router.push('/prescription/import')}
              className="w-12 h-12 rounded-2xl bg-surface-100 items-center justify-center"
              accessibilityLabel="Import prescription"
            >
              <Ionicons name="camera" size={22} color="#06B6D4" />
            </Pressable>
            <Pressable
              onPress={() => router.push('/medication/add')}
              className="w-12 h-12 rounded-2xl bg-primary-500 items-center justify-center"
              style={{ shadowColor: '#06B6D4', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 12, elevation: 6 }}
              accessibilityLabel="Add medication"
            >
              <Ionicons name="add" size={24} color="#fff" />
            </Pressable>
          </>
        }
        bottomSlot={
          <View className="flex-row bg-surface-100 rounded-2xl p-1">
            <Pressable
              onPress={() => setShowArchived(false)}
              className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl ${!showArchived ? 'bg-white' : ''}`}
              style={!showArchived ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 } : {}}
            >
              <Ionicons name="medical" size={16} color={!showArchived ? '#06B6D4' : '#A3A3A3'} />
              <Typography
                variant="body"
                className={`ml-2 font-semibold ${!showArchived ? 'text-primary-700' : 'text-surface-500'}`}
              >
                Active
              </Typography>
              <View className={`ml-2 px-2 py-0.5 rounded-full ${!showArchived ? 'bg-primary-100' : 'bg-surface-200'}`}>
                <Typography variant="small" className={`${!showArchived ? 'text-primary-700 font-bold' : 'text-surface-500 font-medium'}`}>
                  {activeCount}
                </Typography>
              </View>
            </Pressable>

            <Pressable
              onPress={() => setShowArchived(true)}
              className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl ${showArchived ? 'bg-white' : ''}`}
              style={showArchived ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 } : {}}
            >
              <Ionicons name="archive" size={16} color={showArchived ? '#06B6D4' : '#A3A3A3'} />
              <Typography
                variant="body"
                className={`ml-2 font-semibold ${showArchived ? 'text-primary-700' : 'text-surface-500'}`}
              >
                Archived
              </Typography>
              {archivedCount > 0 ? (
                <View className={`ml-2 px-2 py-0.5 rounded-full ${showArchived ? 'bg-primary-100' : 'bg-surface-200'}`}>
                  <Typography
                    variant="small"
                    className={`${showArchived ? 'text-primary-700 font-bold' : 'text-surface-500 font-medium'}`}
                  >
                    {archivedCount}
                  </Typography>
                </View>
              ) : null}
            </Pressable>
          </View>
        }
      />

      <FlatList
        data={displayList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 96,
        }}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/medication/${item.id}`)}>
            <MedicationCard medication={item} allMedications={medications} showChevron />
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={
          <EmptyState
            icon={showArchived ? 'archive-outline' : 'medical-outline'}
            title={showArchived ? 'No archived medications' : 'No medications yet'}
            subtitle={showArchived ? 'Archived medications will appear here' : 'Add your first medication to get started'}
            actionLabel={showArchived ? undefined : 'Add Medication'}
            actionHref={showArchived ? undefined : '/medication/add'}
          />
        }
      />
    </View>
  );
}

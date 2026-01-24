import { View, FlatList, Pressable } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useMedications } from '../../src/hooks/useMedications';
import { MedicationCard } from '../../src/components/medication/MedicationCard';
import { Typography } from '../../src/components/ui/Typography';
import { IconButton } from '../../src/components/ui/IconButton';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Button } from '../../src/components/ui/Button';

export default function MedicationsScreen() {
  const [showArchived, setShowArchived] = useState(false);
  const { medications, archivedMedications, isLoading } = useMedications();

  const displayList = showArchived ? archivedMedications : medications;

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-6 pt-14 pb-4 shadow-sm flex-row justify-between items-center">
        <Typography variant="h1" className="text-gray-900 dark:text-white">
          My Medications
        </Typography>
        <View className="flex-row gap-2">
          <IconButton
            icon="camera"
            size="lg"
            variant="secondary"
            onPress={() => router.push('/prescription/import')}
            accessibilityLabel="Scan prescription"
          />
          <IconButton
            icon="add"
            size="lg"
            variant="primary"
            onPress={() => router.push('/medication/add')}
            accessibilityLabel="Add new medication"
          />
        </View>
      </View>

      {/* Toggle */}
      <View className="px-4 py-3 flex-row gap-2">
        <Button
          title="Active"
          variant={showArchived ? 'outline' : 'primary'}
          size="md"
          onPress={() => setShowArchived(false)}
          className="flex-1"
        />
        <Button
          title="Archived"
          variant={showArchived ? 'primary' : 'outline'}
          size="md"
          onPress={() => setShowArchived(true)}
          className="flex-1"
        />
      </View>

      {/* List */}
      <FlatList
        data={displayList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/medication/${item.id}`)}>
            <MedicationCard medication={item} showChevron />
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={showArchived ? 'archive' : 'medkit'}
            title={showArchived ? 'No archived medications' : 'No medications yet'}
            subtitle={showArchived ? '' : 'Tap + to add your first medication'}
          />
        }
        ItemSeparatorComponent={() => <View className="h-3" />}
      />
    </View>
  );
}

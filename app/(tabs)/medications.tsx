import { View, FlatList, Pressable } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMedications } from '../../src/hooks/useMedications';
import { Icon } from '../../src/components/ui/Icon';
import { Input } from '../../src/components/ui/Input';
import { Pill } from '../../src/components/ui/Pill';
import { Typography } from '../../src/components/ui/Typography';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { AppHeader } from '../../src/components/layout/AppHeader';
import { colors, radii } from '../../src/design/tokens';

export default function MedicationsScreen() {
  const insets = useSafeAreaInsets();
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { medications, archivedMedications } = useMedications();

  const displayList = showArchived ? archivedMedications : medications;
  const activeCount = medications.length;
  const archivedCount = archivedMedications.length;

  // Filter by search query
  const filteredList = displayList.filter((med) =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.dosage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-surface-50" style={{ backgroundColor: colors.surface[50] }}>
      <AppHeader
        title="Medications"
        subtitle="Manage"
        variant="plain"
        right={
          <>
            <Pressable
              onPress={() => router.push('/prescription/import')}
              className="w-12 h-12 rounded-2xl items-center justify-center"
              style={{ backgroundColor: colors.surface[100] }}
              accessibilityLabel="Import prescription"
            >
              <Icon
                name="camera"
                fallback="camera"
                size="md"
                color={colors.primary[500]}
              />
            </Pressable>
            <Pressable
              onPress={() => router.push('/medication/add')}
              className="w-12 h-12 rounded-2xl items-center justify-center"
              style={{
                backgroundColor: colors.primary[500],
                shadowColor: colors.primary[500],
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.22,
                shadowRadius: 12,
                elevation: 6,
              }}
              accessibilityLabel="Add medication"
            >
              <Icon name="plus" fallback="add" size="lg" color={colors.white} />
            </Pressable>
          </>
        }
        bottomSlot={
          <View className="gap-3">
            {/* Search Input */}
            <Input
              placeholder="Search medications..."
              size="md"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {/* Toggle Pills */}
            <View className="flex-row gap-2">
              <Pill
                label={`Active (${activeCount})`}
                selected={!showArchived}
                onPress={() => setShowArchived(false)}
                left={
                  <Icon
                    name="pills.fill"
                    fallback="medkit"
                    size="sm"
                    color={!showArchived ? colors.white : colors.surface[700]}
                  />
                }
              />
              <Pill
                label={`Archived (${archivedCount})`}
                selected={showArchived}
                onPress={() => setShowArchived(true)}
                left={
                  <Icon
                    name="archivebox"
                    fallback="archive"
                    size="sm"
                    color={showArchived ? colors.white : colors.surface[700]}
                  />
                }
              />
            </View>
          </View>
        }
      />

      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 96,
        }}
        renderItem={({ item }) => (
          <View className="mb-3">
            <View
              onPress={() => router.push(`/medication/${item.id}`)}
              accessibilityRole="button"
            >
              {/* Import MedicationListItem component here - using inline for now */}
              <View
                className="rounded-2xl p-4 border"
                style={{
                  backgroundColor: colors.white,
                  borderColor: colors.surface[200],
                  borderRadius: radii.lg,
                  borderCurve: 'continuous',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                }}
              >
                <View className="flex-row items-start">
                  <View
                    className="w-14 h-14 rounded-xl items-center justify-center mr-3.5"
                    style={{ backgroundColor: item.color + '15' }}
                  >
                    <Icon
                      name={item.scheduleType === 'as-needed' ? 'bolt.fill' : 'pills.fill'}
                      fallback={item.scheduleType === 'as-needed' ? 'flash' : 'medkit'}
                      size="lg"
                      color={item.color}
                    />
                  </View>
                  <View className="flex-1">
                    <Typography variant="h3" className="text-surface-900 font-semibold">
                      {item.name}
                    </Typography>
                    <Typography variant="small" className="text-surface-500 mb-1.5">
                      {item.dosage} {item.dosageUnit}
                    </Typography>
                  </View>
                  <Icon
                    name="chevron.right"
                    fallback="chevron-forward"
                    size="md"
                    color={colors.surface[400]}
                  />
                </View>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={showArchived ? 'archivebox' : 'pills'}
            title={searchQuery ? 'No results found' : (showArchived ? 'No archived medications' : 'No medications yet')}
            subtitle={searchQuery
              ? 'Try a different search term'
              : (showArchived ? 'Archived medications will appear here' : 'Add your first medication to get started')
            }
            actionLabel={showArchived ? undefined : 'Add Medication'}
            actionHref={showArchived ? undefined : '/medication/add'}
          />
        }
      />
    </View>
  );
}

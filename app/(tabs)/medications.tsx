import { View, FlatList, Pressable } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMedications } from '../../src/hooks/useMedications';
import { MedicationListItem } from '../../src/components/medication/MedicationListItem';
import { AppHeader } from '../../src/components/layout/AppHeader';
import { SearchInput } from '../../src/components/ui/SearchInput';
import { Pill } from '../../src/components/ui/Pill';
import { Card } from '../../src/components/ui/Card';
import { Icon } from '../../src/components/ui/Icon';
import { Typography } from '../../src/components/ui/Typography';
import { Badge } from '../../src/components/ui/Badge';
import { colors, spacing } from '../../src/design/tokens';

type TabType = 'active' | 'archived';

export default function MedicationsScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabType>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const { medications, archivedMedications } = useMedications();

  // Filter medications based on search query
  const activeFiltered = medications.filter(med =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.dosage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const archivedFiltered = archivedMedications.filter(med =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.dosage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayList = tab === 'active' ? activeFiltered : archivedFiltered;
  const activeCount = medications.length;
  const archivedCount = archivedMedications.length;
  const hasSearchQuery = searchQuery.trim().length > 0;

  return (
    <View className="flex-1 bg-surface-50">
      <AppHeader
        title="Medications"
        subtitle="Manage"
        variant="plain"
        right={
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => router.push('/prescription/import')}
              className="w-11 h-11 rounded-xl bg-surface-100 items-center justify-center border border-surface-200"
              accessibilityLabel="Import prescription"
            >
              <Icon
                name="camera.fill"
                fallback="camera"
                size="md"
                color={colors.primary[500]}
              />
            </Pressable>
            <Pressable
              onPress={() => router.push('/medication/add')}
              className="w-11 h-11 rounded-xl bg-primary-500 items-center justify-center"
              style={{
                shadowColor: colors.primary[500],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 4,
              }}
              accessibilityLabel="Add medication"
            >
              <Icon
                name="plus"
                fallback="add"
                size="md"
                color={colors.white}
              />
            </Pressable>
          </View>
        }
      />

      <FlatList
        data={displayList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + 100,
        }}
        ListHeaderComponent={
          <>
            {/* Tab Pills */}
            <View className="flex-row gap-2 mb-4">
              <Pill
                label="Active"
                size="md"
                variant={tab === 'active' ? 'primary' : 'secondary'}
                selected={tab === 'active'}
                left={
                  <Icon
                    name="pills.fill"
                    fallback="medkit"
                    size={14}
                    color={tab === 'active' ? colors.white : colors.surface[700]}
                  />
                }
                right={
                  <Badge
                    size="sm"
                    variant={tab === 'active' ? 'default' : 'default'}
                    label={activeCount.toString()}
                    className={tab === 'active' ? '' : ''}
                    style={{
                      backgroundColor: tab === 'active' ? 'rgba(255,255,255,0.25)' : colors.surface[200],
                      borderWidth: 0,
                    }}
                  />
                }
                onPress={() => setTab('active')}
              />
              <Pill
                label="Archived"
                size="md"
                variant={tab === 'archived' ? 'primary' : 'secondary'}
                selected={tab === 'archived'}
                left={
                  <Icon
                    name="archivebox.fill"
                    fallback="archive"
                    size={14}
                    color={tab === 'archived' ? colors.white : colors.surface[700]}
                  />
                }
                right={
                  archivedCount > 0 ? (
                    <Badge
                      size="sm"
                      variant="default"
                      label={archivedCount.toString()}
                      style={{
                        backgroundColor: tab === 'archived' ? 'rgba(255,255,255,0.25)' : colors.surface[200],
                        borderWidth: 0,
                      }}
                    />
                  ) : undefined
                }
                onPress={() => setTab('archived')}
              />
            </View>

            {/* Search Input */}
            <View className="mb-4">
              <SearchInput
                placeholder={tab === 'active' ? 'Search medications...' : 'Search archived...'}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View className="mb-3">
            <MedicationListItem
              medication={item}
              allMedications={medications}
              onPress={() => router.push(`/medication/${item.id}`)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-12">
            {/* Empty state illustration */}
            <Card bordered={false} elevation="none" className="mb-6">
              <View
                className="w-24 h-24 rounded-2xl items-center justify-center"
                style={{ backgroundColor: tab === 'active' ? colors.primary[50] : colors.surface[100] }}
              >
                {hasSearchQuery ? (
                  <Icon
                    name="magnifyingglass"
                    fallback="search-outline"
                    size="xl"
                    color={tab === 'active' ? colors.primary[400] : colors.surface[300]}
                  />
                ) : tab === 'active' ? (
                  <Icon
                    name="pills.fill"
                    fallback="medkit"
                    size="xl"
                    color={colors.primary[400]}
                  />
                ) : (
                  <Icon
                    name="archivebox.fill"
                    fallback="archive"
                    size="xl"
                    color={colors.surface[300]}
                  />
                )}
              </View>
            </Card>

            {/* Empty state text */}
            <Typography variant="h2" className="text-surface-900 text-center mb-2">
              {hasSearchQuery
                ? 'No medications found'
                : tab === 'active'
                  ? 'No medications yet'
                  : 'No archived medications'
              }
            </Typography>

            <Typography variant="body" className="text-surface-500 text-center mb-6 max-w-xs">
              {hasSearchQuery
                ? 'Try adjusting your search terms'
                : tab === 'active'
                  ? 'Add your first medication to get started'
                  : 'Archived medications will appear here'
              }
            </Typography>

            {/* Action button for active tab without search */}
            {tab === 'active' && !hasSearchQuery && (
              <Pressable
                onPress={() => router.push('/medication/add')}
                className="px-6 py-3 bg-primary-500 rounded-xl flex-row items-center justify-center"
                style={{
                  shadowColor: colors.primary[500],
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 12,
                  elevation: 4,
                }}
              >
                <Icon name="plus" fallback="add" size="md" color={colors.white} />
                <Typography variant="button" className="text-white ml-2 font-semibold">
                  Add Medication
                </Typography>
              </Pressable>
            )}
          </View>
        }
      />
    </View>
  );
}

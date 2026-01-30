import { View, FlatList, Pressable } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

import { useMedications } from '../../src/hooks/useMedications';
import { useStaggeredAnimation } from '../../src/hooks/useStaggeredAnimation';
import { MedicationListItem } from '../../src/components/medication/MedicationListItem';
import { AppHeader } from '../../src/components/layout/AppHeader';
import { SearchInput } from '../../src/components/ui/SearchInput';
import { Pill } from '../../src/components/ui/Pill';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Icon } from '../../src/components/ui/Icon';
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

  const renderEmptyState = () => {
    if (hasSearchQuery) {
      return (
        <Animated.View entering={FadeInDown.delay(200).springify()} style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            sfSymbol="magnifyingglass"
            fallbackIcon="search-outline"
            title="No results found"
            subtitle="Try adjusting your search terms"
            variant="surface"
          />
        </Animated.View>
      );
    }

    if (tab === 'active') {
      return (
        <Animated.View entering={FadeInDown.delay(200).springify()} style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            sfSymbol="pills"
            fallbackIcon="medkit-outline"
            title="No medications yet"
            subtitle="Add your first medication to get started tracking your health"
            actionLabel="Add Medication"
            actionHref="/medication/add"
            variant="primary"
          />
        </Animated.View>
      );
    }

    return (
      <Animated.View entering={FadeInDown.delay(200).springify()} style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState
          sfSymbol="archivebox"
          fallbackIcon="archive"
          title="No archived medications"
          subtitle="Archived medications will appear here"
          variant="surface"
        />
      </Animated.View>
    );
  };

  return (
    <View className="flex-1 bg-surface-50">
      <Animated.View entering={FadeIn.duration(250)}>
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
                  shadowColor: 'rgba(6, 182, 212, 0.25)',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 1,
                  shadowRadius: 12,
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
      </Animated.View>

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
            <Animated.View entering={FadeInDown.delay(100).springify()} className="flex-row gap-2 mb-4">
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
            </Animated.View>

            {/* Search Input */}
            <Animated.View entering={FadeInDown.delay(150).springify()} className="mb-4">
              <SearchInput
                placeholder={tab === 'active' ? 'Search medications...' : 'Search archived...'}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </Animated.View>
          </>
        }
        renderItem={({ item, index }) => (
          <Animated.View
            className="mb-3"
            entering={useStaggeredAnimation(index, 50, 'up')}
            layout={Animated.springify().damping(15).stiffness(200)}
          >
            <MedicationListItem
              medication={item}
              allMedications={medications}
              onPress={() => router.push(`/medication/${item.id}`)}
            />
          </Animated.View>
        )}
        ListEmptyComponent={renderEmptyState()}
      />
    </View>
  );
}

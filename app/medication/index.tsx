import { View, Pressable, TextInput, FlatList, StyleSheet, Text } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii } from '../../src/design/tokens';
import { useMedicationForm } from '../../src/contexts/MedicationFormContext';
import { Typography } from '../../src/components/ui/Typography';
import { WizardScreen } from '../../src/components/medication/WizardScreen';
import { MedicationPreviewCard } from '../../src/components/medication/MedicationPreviewCard';
import * as Haptics from 'expo-haptics';

// Common medications for autocomplete suggestions
const COMMON_MEDICATIONS = [
  { name: 'Metformin', dosage: '500', unit: 'mg' },
  { name: 'Lisinopril', dosage: '10', unit: 'mg' },
  { name: 'Amlodipine', dosage: '5', unit: 'mg' },
  { name: 'Atorvastatin', dosage: '20', unit: 'mg' },
  { name: 'Omeprazole', dosage: '20', unit: 'mg' },
  { name: 'Levothyroxine', dosage: '50', unit: 'mcg' },
  { name: 'Losartan', dosage: '50', unit: 'mg' },
  { name: 'Gabapentin', dosage: '300', unit: 'mg' },
  { name: 'Ibuprofen', dosage: '400', unit: 'mg' },
  { name: 'Acetaminophen', dosage: '500', unit: 'mg' },
  { name: 'Aspirin', dosage: '81', unit: 'mg' },
];

const DOSAGE_UNITS = [
  { label: 'tablet', icon: 'ellipse' },
  { label: 'capsule', icon: 'ellipse-outline' },
  { label: 'mg', icon: 'flask-outline' },
  { label: 'mL', icon: 'water-outline' },
  { label: 'drop', icon: 'water' },
  { label: 'puff', icon: 'cloud-outline' },
];

const MEDICATION_COLORS = [
  '#06B6D4',
  '#F97316',
  '#8B5CF6',
  '#22C55E',
  '#EF4444',
  '#EC4899',
  '#F59E0B',
  '#6366F1',
];

export default function AddMedicationStep1() {
  const { formData, updateFormData, isEditing } = useMedicationForm();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredMeds, setFilteredMeds] = useState(COMMON_MEDICATIONS);

  const canProceed = formData.name.trim().length > 0 && formData.dosage.trim().length > 0;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const filtered = COMMON_MEDICATIONS.filter((med) =>
        med.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMeds(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectMedication = (med: typeof COMMON_MEDICATIONS[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateFormData({
      name: med.name,
      dosage: med.dosage,
      dosageUnit: med.unit,
    });
    setSearchQuery(med.name);
    setShowSuggestions(false);
  };

  const clearSelection = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateFormData({ name: '', dosage: '', dosageUnit: 'tablet' });
    setSearchQuery('');
  };

  const renderSuggestion = ({ item }: { item: typeof COMMON_MEDICATIONS[0] }) => (
    <Pressable
      onPress={() => handleSelectMedication(item)}
      style={styles.suggestionItem}
    >
      <View style={styles.suggestionIcon}>
        <Ionicons name="medkit" size={18} color={colors.surface[300]} />
      </View>
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionName}>{item.name}</Text>
        <Text style={styles.suggestionDetails}>{item.dosage} {item.unit}</Text>
      </View>
      <Ionicons name="add-circle" size={20} color={colors.primary[500]} />
    </Pressable>
  );

  return (
    <WizardScreen
      stepNumber={1}
      totalSteps={5}
      title={isEditing ? 'Edit medication' : 'Add medication'}
      subtitle="Step 1 of 5 · Name and dosage"
      onNext={() => router.push('/medication/schedule')}
      canProceed={canProceed}
      nextLabel="Schedule"
      keyboardAvoiding={true}
      padBottomExtra={160}
    >
      <View style={styles.container}>
        {/* Preview Card */}
        <MedicationPreviewCard
          name={formData.name}
          dosage={formData.dosage}
          dosageUnit={formData.dosageUnit}
          instructions={formData.instructions}
          color={formData.color}
        />

        {/* Medication Search Card */}
        <View style={styles.card}>
          <Typography variant="label" style={styles.label}>
            Medication name
          </Typography>

          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Ionicons name="search" size={18} color={colors.surface[300]} />
              <TextInput
                style={styles.searchInput}
                value={formData.name}
                onChangeText={(text) => {
                  updateFormData({ name: text });
                  handleSearch(text);
                }}
                placeholder="Search medications..."
                placeholderTextColor={colors.surface[300]}
                onFocus={() => setShowSuggestions(filteredMeds.length > 0)}
                autoFocus
              />
              {formData.name.length > 0 && (
                <Pressable onPress={clearSelection} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={18} color={colors.surface[300]} />
                </Pressable>
              )}
            </View>

            {showSuggestions && (
              <View style={styles.suggestionsList}>
                <FlatList
                  data={filteredMeds}
                  renderItem={renderSuggestion}
                  keyExtractor={(item) => item.name}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            )}
          </View>

          {/* Dosage */}
          <View style={styles.dosageSection}>
            <Typography variant="label" style={styles.label}>
              Dosage
            </Typography>
            <View style={styles.dosageInputs}>
              <View style={styles.dosageInputContainer}>
                <TextInput
                  style={styles.dosageInput}
                  value={formData.dosage}
                  onChangeText={(text) => updateFormData({ dosage: text })}
                  placeholder="500"
                  placeholderTextColor={colors.surface[300]}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.dosageInputContainer}>
                <TextInput
                  style={styles.dosageInput}
                  value={formData.dosageUnit}
                  onChangeText={(text) => updateFormData({ dosageUnit: text })}
                  placeholder="mg"
                  placeholderTextColor={colors.surface[300]}
                />
              </View>
            </View>

            <View style={styles.unitChips}>
              {DOSAGE_UNITS.map((unit) => {
                const selected = formData.dosageUnit === unit.label;
                return (
                  <Pressable
                    key={unit.label}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      updateFormData({ dosageUnit: unit.label });
                    }}
                    style={[styles.unitChip, selected && styles.unitChipSelected]}
                  >
                    <Ionicons
                      name={unit.icon as any}
                      size={14}
                      color={selected ? colors.primary[500] : colors.surface[500]}
                    />
                    <Typography variant="small" style={selected ? styles.unitLabelSelected : styles.unitLabel}>
                      {unit.label}
                    </Typography>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.card}>
          <Typography variant="label" style={styles.label}>
            Instructions <Typography variant="small" style={styles.optionalLabel}>(optional)</Typography>
          </Typography>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              value={formData.instructions}
              onChangeText={(text) => updateFormData({ instructions: text })}
              placeholder="e.g., Take with a full glass of water"
              placeholderTextColor={colors.surface[300]}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Color */}
        <View style={styles.card}>
          <Typography variant="label" style={styles.label}>
            Color tag
          </Typography>
          <View style={styles.colorOptions}>
            {MEDICATION_COLORS.map((color) => {
              const selected = formData.color === color;
              return (
                <Pressable
                  key={color}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    updateFormData({ color });
                  }}
                  style={[styles.colorOption, selected && styles.colorOptionSelected]}
                >
                  {selected ? <Ionicons name="checkmark" size={16} color="white" /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderCurve: 'continuous',
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surface[100],
  },
  label: {
    color: colors.surface[500],
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  optionalLabel: {
    textTransform: 'none',
    fontWeight: '400',
    color: colors.surface[300],
  },
  searchContainer: {
    position: 'relative',
    zIndex: 10,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface[100],
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    minHeight: 52,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.surface[900],
    paddingVertical: 12,
  },
  clearButton: {
    padding: spacing.xs,
  },
  suggestionsList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.surface[200],
    marginTop: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    maxHeight: 240,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface[100],
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: colors.surface[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.surface[900],
  },
  suggestionDetails: {
    fontSize: 13,
    color: colors.surface[500],
    marginTop: 2,
  },
  dosageSection: {
    marginTop: spacing.md,
  },
  dosageInputs: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  dosageInputContainer: {
    flex: 1,
  },
  dosageInput: {
    backgroundColor: colors.surface[100],
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.surface[900],
    minHeight: 52,
  },
  unitChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  unitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    backgroundColor: colors.surface[100],
    gap: spacing.xs,
  },
  unitChipSelected: {
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  unitLabel: {
    fontSize: 13,
    color: colors.surface[500],
    fontWeight: '500',
  },
  unitLabelSelected: {
    color: colors.primary[700],
  },
  textAreaContainer: {
    backgroundColor: colors.surface[100],
    borderRadius: radii.md,
    padding: spacing.md,
  },
  textArea: {
    fontSize: 15,
    color: colors.surface[900],
    minHeight: 80,
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: colors.surface[900],
  },
});

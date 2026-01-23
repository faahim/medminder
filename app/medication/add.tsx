import { useEffect } from 'react';
import { router } from 'expo-router';
import { useMedicationForm } from '../../src/contexts/MedicationFormContext';
import { View } from 'react-native';

// This screen initializes the add medication form and redirects to the wizard
export default function AddMedicationScreen() {
  const { setIsEditing, setEditingId } = useMedicationForm();

  useEffect(() => {
    // Clear any previous edit state
    setIsEditing(false);
    setEditingId(null);
    
    // Redirect to the first step of the wizard
    router.replace('/medication');
  }, [setIsEditing, setEditingId]);

  return <View />;
}

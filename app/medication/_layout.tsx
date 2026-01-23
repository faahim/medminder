import { Stack } from 'expo-router';
import { MedicationFormProvider } from '../../src/contexts';

export default function AddMedicationWizardLayout() {
  return (
    <MedicationFormProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          presentation: 'card',
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#06B6D4',
          headerTitleStyle: {
            fontWeight: '600',
            color: '#171717',
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: 'Add Medication' }}
        />
        <Stack.Screen
          name="schedule"
          options={{ title: 'Schedule' }}
        />
        <Stack.Screen
          name="meal"
          options={{ title: 'Meal Timing' }}
        />
        <Stack.Screen
          name="duration"
          options={{ title: 'Duration' }}
        />
        <Stack.Screen
          name="confirm"
          options={{ title: 'Review' }}
        />
      </Stack>
    </MedicationFormProvider>
  );
}

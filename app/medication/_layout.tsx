import { Stack } from 'expo-router';
import { MedicationFormProvider } from '../../src/contexts';

export default function AddMedicationWizardLayout() {
  return (
    <MedicationFormProvider>
      <Stack 
        screenOptions={{
          headerShown: true,
          presentation: 'card',
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ title: 'Step 1: Name & Dosage' }}
        />
        <Stack.Screen 
          name="schedule" 
          options={{ title: 'Step 2: Schedule' }}
        />
        <Stack.Screen 
          name="meal" 
          options={{ title: 'Step 3: Meal Timing' }}
        />
        <Stack.Screen 
          name="duration" 
          options={{ title: 'Step 4: Duration' }}
        />
        <Stack.Screen 
          name="confirm" 
          options={{ title: 'Step 5: Review' }}
        />
      </Stack>
    </MedicationFormProvider>
  );
}

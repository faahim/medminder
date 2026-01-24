import { Stack } from 'expo-router';
import { PrescriptionImportProvider } from '../../src/contexts';

export default function PrescriptionLayout() {
  return (
    <PrescriptionImportProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </PrescriptionImportProvider>
  );
}

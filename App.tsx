// IMPORTANT: This must be the first import for UUID generation to work
import 'react-native-get-random-values';

import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <Slot />
    </>
  );
}

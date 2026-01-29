import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SymbolView } from 'expo-symbols';
import { GlassView } from 'expo-glass-effect';

export default function DepsTestScreen() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  }, []);

  const onPress = async () => {
    // Verify expo-haptics wiring
    await Haptics.selectionAsync();

    // Verify Reanimated runtime
    scale.value = withSpring(1.12, { damping: 12, stiffness: 220 }, () => {
      scale.value = withSpring(1);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dependency Smoke Test</Text>

      <View style={styles.row}>
        <Text style={styles.label}>expo-symbols</Text>
        <SymbolView
          name="sparkles"
          size={28}
          type="hierarchical"
          fallback={<Text style={styles.fallback}>★</Text>}
        />
      </View>

      <Text style={styles.section}>expo-glass-effect</Text>
      <View style={styles.glassDemoWrap}>
        <View style={styles.glassBackdrop} />
        <GlassView style={styles.glass} glassEffectStyle="regular" />
      </View>

      <Text style={styles.section}>reanimated + haptics</Text>
      <Pressable accessibilityRole="button" onPress={onPress}>
        <Animated.View style={[styles.button, animatedStyle]}>
          <Text style={styles.buttonText}>Press me</Text>
        </Animated.View>
      </Pressable>

      <Text style={styles.note}>
        Note: GlassView is only available on iOS 26+. On unsupported platforms it
        falls back to a regular View.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    gap: 14,
    backgroundColor: '#0b0b10',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  label: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  fallback: {
    color: 'white',
    fontSize: 22,
  },
  section: {
    marginTop: 8,
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
  },
  glassDemoWrap: {
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1b1b25',
  },
  glassBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#3b82f6',
    opacity: 0.35,
  },
  glass: {
    flex: 1,
  },
  button: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  note: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    lineHeight: 16,
  },
});

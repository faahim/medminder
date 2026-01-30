import React, { useState } from 'react';
import { Alert, Image, View, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';

import { Screen } from '../../src/components/layout/Screen';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { Icon } from '../../src/components/ui/Icon';
import { Card } from '../../src/components/ui/Card';
import { PrescriptionVisionService } from '../../src/services/prescriptionVision.service';
import { usePrescriptionImport } from '../../src/contexts';

type ImportState = 'idle' | 'processing' | 'error' | 'success';

function LoadingSpinner({ size = 48 }: { size?: number }) {
  const rotation = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: withRepeat(
          withTiming('360deg', {
            duration: 1000,
            easing: Easing.linear,
          }),
          -1,
        ),
      },
    ],
  }));

  return (
    <Animated.View style={rotation}>
      <Icon name="camera.aperture" fallback="camera" size={size} color="#06B6D4" />
    </Animated.View>
  );
}

function SuccessCheckmark() {
  const scale = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withTiming(1, {
          duration: 400,
          easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        }),
      },
      {
        rotate: withTiming('0deg', {
          duration: 400,
          easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        }),
      },
    ],
    opacity: withTiming(1, { duration: 300 }),
  }));

  return (
    <Animated.View style={[{ width: 80, height: 80, alignItems: 'center', justifyContent: 'center' }, scale]}>
      <Icon name="checkmark.circle.fill" fallback="checkmark-circle" size={80} color="#22C55E" />
    </Animated.View>
  );
}

function ErrorIcon() {
  const shake = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withRepeat(
          withSequence(
            withTiming(-10, { duration: 100 }),
            withTiming(10, { duration: 100 }),
            withTiming(0, { duration: 100 })
          ),
          2,
        ),
      },
    ],
  }));

  return (
    <Animated.View style={shake}>
      <Icon name="exclamationmark.triangle.fill" fallback="warning" size={64} color="#EF4444" />
    </Animated.View>
  );
}

function Corner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const base = 'absolute w-6 h-6 border-white';
  const styleByPos: Record<typeof position, string> = {
    tl: 'top-3 left-3 border-l-2 border-t-2 rounded-tl-xl',
    tr: 'top-3 right-3 border-r-2 border-t-2 rounded-tr-xl',
    bl: 'bottom-3 left-3 border-l-2 border-b-2 rounded-bl-xl',
    br: 'bottom-3 right-3 border-r-2 border-b-2 rounded-br-xl',
  };
  return <View className={`${base} ${styleByPos[position]}`} />;
}

function ImportOptionCard({
  icon,
  fallback,
  title,
  description,
  onPress,
}: {
  icon: string;
  fallback: string;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Card className="p-5 active:opacity-80" style={{ elevation: 0 }}>
      <View className="flex-row items-center gap-4">
        <View className="w-14 h-14 rounded-2xl bg-primary-50 items-center justify-center flex-shrink-0">
          <Icon name={icon as any} fallback={fallback as any} size={28} color="#06B6D4" />
        </View>
        <View className="flex-1">
          <Typography variant="h3" className="text-surface-900 font-semibold mb-1">
            {title}
          </Typography>
          <Typography variant="small" className="text-surface-500">
            {description}
          </Typography>
        </View>
        <Icon name="chevron.right" fallback="chevron-forward" size={20} color="#A3A3A3" />
      </View>
    </Card>
  );
}

export default function PrescriptionImportScreen() {
  const { imageUri, setImageUri, setDrafts, reset } = usePrescriptionImport();
  const [importState, setImportState] = useState<ImportState>('idle');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [importCount, setImportCount] = useState(0);

  const hasImage = !!imageUri;

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Camera permission is needed.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.85,
      base64: true,
      allowsEditing: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setImageUri(asset.uri);
    setImageBase64(asset.base64 ?? null);
  };

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Photo library permission is needed.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.85,
      base64: true,
      allowsEditing: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setImageUri(asset.uri);
    setImageBase64(asset.base64 ?? null);
  };

  const extract = async () => {
    if (!imageBase64) {
      Alert.alert('No image', 'Please take or select a photo first.');
      return;
    }
    Alert.alert(
      'Scan prescription?',
      'We\'ll extract medications from this image for you to review.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Scan',
          onPress: async () => {
            try {
              setImportState('processing');
              const drafts = await PrescriptionVisionService.extractFromImageBase64({
                base64: imageBase64,
                mimeType: 'image/jpeg',
                localeHint: 'bn-BD',
              });

              if (!drafts.length) {
                setImportState('error');
                return;
              }

              setDrafts(drafts);
              setImportCount(drafts.length);
              setImportState('success');

              // Auto-navigate to review after a brief success animation
              setTimeout(() => {
                router.push('/prescription/review');
              }, 1500);
            } catch (e: any) {
              setImportState('error');
              console.error('Extraction error:', e);
            }
          },
        },
      ]
    );
  };

  const clearImage = () => {
    setImageUri(null);
    setImageBase64(null);
    setImportState('idle');
  };

  const tryAgain = () => {
    setImportState('idle');
  };

  // Error State
  if (importState === 'error') {
    return (
      <View className="flex-1 bg-surface-50">
        <Screen scroll includeTopInset padX={16} padY={16}>
          <View className="flex-1 items-center justify-center py-12">
            <ErrorIcon />
            <Typography variant="h2" className="text-surface-900 font-semibold mt-6 mb-3">
              Scan failed
            </Typography>
            <Typography variant="body" className="text-surface-600 text-center mb-8 px-4">
              We couldn't extract medications from this image. Please try again with a clearer photo.
            </Typography>
            <View className="w-full gap-3">
              <Button title="Try again" variant="primary" onPress={tryAgain} fullWidth />
              <Button title="Cancel" variant="outline" onPress={() => router.back()} fullWidth />
            </View>
          </View>
        </Screen>
      </View>
    );
  }

  // Processing State
  if (importState === 'processing') {
    return (
      <View className="flex-1 bg-surface-50">
        <Screen scroll includeTopInset padX={16} padY={16}>
          <View className="flex-1 items-center justify-center py-12">
            <LoadingSpinner size={64} />
            <Typography variant="h3" className="text-surface-900 font-semibold mt-8 mb-2">
              Scanning prescription...
            </Typography>
            <Typography variant="body" className="text-surface-500 text-center">
              Extracting medications with AI
            </Typography>
            {imageUri && (
              <Card className="mt-8 overflow-hidden" style={{ width: '100%', maxWidth: 280 }}>
                <Image source={{ uri: imageUri }} style={{ width: '100%', height: 200 }} resizeMode="cover" />
              </Card>
            )}
          </View>
        </Screen>
      </View>
    );
  }

  // Success State (shown briefly before navigation)
  if (importState === 'success') {
    return (
      <View className="flex-1 bg-surface-50">
        <Screen scroll includeTopInset padX={16} padY={16}>
          <View className="flex-1 items-center justify-center py-12">
            <SuccessCheckmark />
            <Typography variant="h2" className="text-surface-900 font-semibold mt-6 mb-3">
              Scan complete!
            </Typography>
            <Typography variant="body" className="text-surface-600 text-center">
              {importCount} medication{importCount === 1 ? '' : 's'} found
            </Typography>
          </View>
        </Screen>
      </View>
    );
  }

  // Main Screen
  return (
    <View className="flex-1 bg-surface-50">
      <Screen scroll includeTopInset padX={16} padY={16} padBottomExtra={120}>
        <View className="flex-row items-center justify-between mb-2">
          <Typography variant="h1" className="text-surface-900">
            Scan prescription
          </Typography>
          <Button
            title="Close"
            variant="ghost"
            size="sm"
            onPress={() => {
              reset();
              router.back();
            }}
          />
        </View>

        <Typography variant="body" className="text-surface-600 mb-6">
          Take a clear photo of your prescription. We'll extract the medications for you to review.
        </Typography>

        {/* Image Preview Area */}
        <Card className="mb-6 overflow-hidden">
          {hasImage ? (
            <View className="relative bg-surface-100">
              <Image source={{ uri: imageUri }} style={{ width: '100%', aspectRatio: 3/4 }} resizeMode="cover" />
              <View className="absolute inset-0">
                <View className="absolute inset-4 border border-white/50 rounded-2xl" />
                <Corner position="tl" />
                <Corner position="tr" />
                <Corner position="bl" />
                <Corner position="br" />
              </View>
              <View className="absolute bottom-4 left-4 right-4">
                <Button
                  title="Retake photo"
                  variant="primary"
                  onPress={pickFromCamera}
                  size="md"
                  fullWidth
                />
              </View>
            </View>
          ) : (
            <View className="aspect-[3/4] items-center justify-center bg-surface-50">
              <View className="w-24 h-24 rounded-3xl bg-surface-100 items-center justify-center mb-4">
                <Icon name="camera.fill" fallback="camera" size={40} color="#A3A3A3" />
              </View>
              <Typography variant="body" className="text-surface-600 font-medium mb-2">
                No photo selected
              </Typography>
              <Typography variant="small" className="text-surface-500 text-center px-8">
                Choose an option below to capture your prescription
              </Typography>
            </View>
          )}
        </Card>

        {/* Import Options */}
        {!hasImage ? (
          <View className="gap-3 mb-6">
            <ImportOptionCard
              icon="camera.fill"
              fallback="camera"
              title="Camera"
              description="Take a new photo of your prescription"
              onPress={pickFromCamera}
            />
            <ImportOptionCard
              icon="photo.fill"
              fallback="image"
              title="Photo Library"
              description="Choose an existing photo from your device"
              onPress={pickFromLibrary}
            />
          </View>
        ) : (
          <View className="gap-3 mb-6">
            <Button
              title="Scan this photo"
              variant="primary"
              onPress={extract}
              fullWidth
            />
            <Button
              title="Choose different photo"
              variant="outline"
              onPress={pickFromLibrary}
              fullWidth
            />
          </View>
        )}

        {/* Photo Tips */}
        <Card className="p-5">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-xl bg-primary-50 items-center justify-center mr-3">
              <Icon name="lightbulb.fill" fallback="bulb" size={20} color="#06B6D4" />
            </View>
            <Typography variant="h3" className="text-surface-900 font-semibold">
              Tips for best results
            </Typography>
          </View>
          <View className="gap-3">
            {[
              'Ensure the entire prescription is visible in frame',
              'Use good lighting and avoid shadows on the text',
              'Hold steady for a clear, sharp image',
              'Avoid glare by adjusting the angle if needed',
            ].map((tip, i) => (
              <View key={i} className="flex-row items-start">
                <View className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 mr-3 flex-shrink-0" />
                <Typography variant="small" className="text-surface-700 flex-1">
                  {tip}
                </Typography>
              </View>
            ))}
          </View>
        </Card>

        <Typography variant="small" className="text-surface-400 mt-6 text-center">
          Powered by OpenAI Vision
        </Typography>
      </Screen>
    </View>
  );
}

import { useMemo, useState } from 'react';
import { Alert, Image, Pressable, Switch, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../../src/components/layout/Screen';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { PrescriptionVisionService } from '../../src/services/prescriptionVision.service';
import { usePrescriptionImport } from '../../src/contexts';

function Corner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const base = 'absolute w-6 h-6 border-white';
  const styleByPos: Record<typeof position, string> = {
    tl: 'top-2 left-2 border-l-2 border-t-2 rounded-tl-xl',
    tr: 'top-2 right-2 border-r-2 border-t-2 rounded-tr-xl',
    bl: 'bottom-2 left-2 border-l-2 border-b-2 rounded-bl-xl',
    br: 'bottom-2 right-2 border-r-2 border-b-2 rounded-br-xl',
  };
  return <View className={`${base} ${styleByPos[position]}`} />;
}

export default function PrescriptionImportScreen() {
  const insets = useSafeAreaInsets();
  const { imageUri, setImageUri, setDrafts, reset } = usePrescriptionImport();
  const [isExtracting, setIsExtracting] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [autoCrop, setAutoCrop] = useState(true);

  const hasImage = !!imageUri;

  const tips = useMemo(
    () => ['Place the whole page inside the frame', 'Use good lighting (avoid shadows)', 'Keep text sharp — hold steady', 'Avoid glare (tilt if needed)'],
    []
  );

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Camera permission is needed.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.85, base64: true, allowsEditing: autoCrop });
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
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.85, base64: true, allowsEditing: autoCrop });
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
    Alert.alert('Send for extraction?', "We'll scan this image and generate your medication list.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Continue',
        onPress: async () => {
          try {
            setIsExtracting(true);
            const drafts = await PrescriptionVisionService.extractFromImageBase64({ base64: imageBase64, mimeType: 'image/jpeg', localeHint: 'bn-BD' });
            if (!drafts.length) {
              Alert.alert('No medications found', 'Try a clearer photo.');
              return;
            }
            setDrafts(drafts);
            router.push('/prescription/review');
          } catch (e: any) {
            Alert.alert('Extraction failed', e?.message ?? 'Please try again.');
          } finally {
            setIsExtracting(false);
          }
        },
      },
    ]);
  };

  const clearImage = () => {
    setImageUri(null);
    setImageBase64(null);
  };

  return (
    <View className="flex-1 bg-surface-50">
      <Screen scroll includeTopInset padX={16} padY={16} padBottomExtra={16}>
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
          Take a clear photo. We'll extract meds for you to review.
        </Typography>

        <View className="bg-white rounded-3xl border border-surface-100 p-5 mb-4">
          <View className="rounded-3xl overflow-hidden bg-surface-100">
            {hasImage ? (
              <View className="relative">
                <Image source={{ uri: imageUri! }} style={{ width: '100%', height: 320 }} resizeMode="cover" />
                <View className="absolute inset-0">
                  <View className="absolute inset-3 border border-white/50 rounded-2xl" />
                  <Corner position="tl" />
                  <Corner position="tr" />
                  <Corner position="bl" />
                  <Corner position="br" />
                  <View className="absolute left-0 right-0 bottom-0 px-4 py-3 bg-black/40">
                    <Typography variant="small" className="text-white">
                      Ensure the full page is visible
                    </Typography>
                  </View>
                </View>
              </View>
            ) : (
              <View className="h-80 items-center justify-center">
                <View className="w-full px-6">
                  <View className="h-56 rounded-3xl border border-dashed border-surface-300 items-center justify-center">
                    <Ionicons name="camera-outline" size={48} color="#A3A3A3" />
                    <Typography variant="body" className="text-surface-600 font-medium text-center mt-3">
                      No image yet
                    </Typography>
                    <Typography variant="small" className="text-surface-500 text-center mt-2">
                      Use camera or pick from library
                    </Typography>
                  </View>
                </View>
              </View>
            )}
          </View>

          {!hasImage ? (
            <View className="flex-row gap-3 mt-4">
              <Button title="Camera" variant="primary" className="flex-1" onPress={pickFromCamera} />
              <Button title="Library" variant="outline" className="flex-1" onPress={pickFromLibrary} />
            </View>
          ) : (
            <View className="mt-4 gap-3">
              <View className="flex-row gap-3">
                <Button title="Retake" variant="primary" className="flex-1" onPress={pickFromCamera} />
                <Button title="Choose different" variant="outline" className="flex-1" onPress={pickFromLibrary} />
              </View>
              <Pressable onPress={clearImage} className="py-2">
                <Typography variant="body" className="text-center text-surface-500">
                  Remove photo
                </Typography>
              </Pressable>
            </View>
          )}
        </View>

        <View className="bg-white rounded-3xl border border-surface-100 p-4 mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Typography variant="body" className="text-surface-900 font-medium">
                Auto-crop
              </Typography>
              <Typography variant="small" className="text-surface-500">
                Lets you crop/rotate before scanning
              </Typography>
            </View>
            <Switch value={autoCrop} onValueChange={setAutoCrop} trackColor={{ false: '#E0E0E0', true: '#06B6D480' }} thumbColor={autoCrop ? '#06B6D4' : '#f4f3f4'} />
          </View>
        </View>

        <View className="bg-white rounded-3xl border border-surface-100 p-5 mb-4">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-xl bg-primary-50 items-center justify-center mr-3">
              <Ionicons name="bulb-outline" size={18} color="#06B6D4" />
            </View>
            <Typography variant="h3" className="text-surface-900">
              Photo tips
            </Typography>
          </View>
          <View className="gap-2">
            {tips.map((t) => (
              <View key={t} className="flex-row">
                <Typography variant="body" className="text-primary-600 mr-2">
                  •
                </Typography>
                <Typography variant="small" className="text-surface-700 flex-1">
                  {t}
                </Typography>
              </View>
            ))}
          </View>
        </View>

        <Button title={isExtracting ? 'Extracting…' : 'Extract medications'} variant="primary" onPress={extract} disabled={!hasImage || isExtracting} fullWidth />

        <Typography variant="small" className="text-surface-500 mt-3 text-center">
          Uses OpenAI vision for extraction
        </Typography>
      </Screen>
    </View>
  );
}

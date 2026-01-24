import { useMemo, useState } from 'react';
import { Alert, Image, Pressable, Switch, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
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
  const { imageUri, setImageUri, setDrafts, reset } = usePrescriptionImport();
  const [isExtracting, setIsExtracting] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [autoCrop, setAutoCrop] = useState(true);

  const hasImage = !!imageUri;

  const tips = useMemo(
    () => [
      'Place the whole page inside the frame',
      'Use good lighting (avoid shadows)',
      'Keep text sharp — hold steady',
      'Avoid glare (tilt slightly if needed)',
    ],
    []
  );

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Camera permission is required to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.85,
      base64: true,
      allowsEditing: autoCrop,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    setImageUri(asset.uri);
    setImageBase64(asset.base64 ?? null);
  };

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Photo library permission is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.85,
      base64: true,
      allowsEditing: autoCrop,
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
      'Send for extraction?',
      'We’ll scan this image and generate your medication list for review.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            try {
              setIsExtracting(true);
              const drafts = await PrescriptionVisionService.extractFromImageBase64({
                base64: imageBase64,
                mimeType: 'image/jpeg',
                localeHint: 'bn-BD',
              });

              if (!drafts.length) {
                Alert.alert('No medications found', 'Try taking a clearer photo and try again.');
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
      ]
    );
  };

  const clearImage = () => {
    setImageUri(null);
    setImageBase64(null);
  };

  return (
    <ScreenWrapper scrollable className="px-6 pt-14">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2">
        <Typography variant="h1" className="text-gray-900 dark:text-white">
          Scan Prescription
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

      <Typography variant="body" className="text-gray-600 dark:text-gray-300 mb-4">
        Take a clear photo. We’ll extract your meds and you’ll review everything before saving.
      </Typography>

      {/* Preview */}
      <Card className="p-4 mb-4">
        <View className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
          {hasImage ? (
            <View className="relative">
              <Image
                source={{ uri: imageUri! }}
                style={{ width: '100%', height: 320 }}
                resizeMode="cover"
              />

              {/* Frame overlay */}
              <View className="absolute inset-0">
                <View className="absolute inset-3 border border-white/50 rounded-2xl" />
                <Corner position="tl" />
                <Corner position="tr" />
                <Corner position="bl" />
                <Corner position="br" />

                <View className="absolute left-0 right-0 bottom-0 px-4 py-3 bg-black/40">
                  <Typography variant="small" className="text-white">
                    Make sure the full page is visible and readable
                  </Typography>
                </View>
              </View>
            </View>
          ) : (
            <View className="h-80 items-center justify-center">
              <View className="w-full px-6">
                <View className="h-56 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 items-center justify-center">
                  <Typography variant="body" className="text-gray-600 dark:text-gray-300 font-medium text-center">
                    No image yet
                  </Typography>
                  <Typography variant="small" className="text-gray-500 dark:text-gray-400 text-center mt-2">
                    Use camera or select from your library
                  </Typography>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Actions */}
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
              <Typography variant="body" className="text-center text-gray-500 dark:text-gray-400">
                Remove photo
              </Typography>
            </Pressable>
          </View>
        )}
      </Card>

      {/* Options */}
      <Card className="p-4 mb-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Typography variant="body" className="text-gray-900 dark:text-white font-medium">
              Auto-crop
            </Typography>
            <Typography variant="small" className="text-gray-500 dark:text-gray-400">
              Lets you crop/rotate before scanning
            </Typography>
          </View>
          <Switch
            value={autoCrop}
            onValueChange={setAutoCrop}
            trackColor={{ false: '#E0E0E0', true: '#4CAF5080' }}
            thumbColor={autoCrop ? '#4CAF50' : '#f4f3f4'}
          />
        </View>
      </Card>

      {/* Tips */}
      <Card className="p-4 mb-4">
        <Typography variant="h3" className="text-gray-900 dark:text-white mb-2">
          Photo tips
        </Typography>
        <View className="gap-2">
          {tips.map((t) => (
            <View key={t} className="flex-row">
              <Typography variant="body" className="text-green-600 dark:text-green-400 mr-2">
                •
              </Typography>
              <Typography variant="small" className="text-gray-600 dark:text-gray-300 flex-1">
                {t}
              </Typography>
            </View>
          ))}
        </View>
      </Card>

      <Button
        title={isExtracting ? 'Extracting…' : 'Extract medications'}
        variant="primary"
        onPress={extract}
        disabled={!hasImage || isExtracting}
      />

      <Typography variant="small" className="text-gray-500 dark:text-gray-400 mt-3">
        Temporary: this sends the image directly to OpenAI for extraction.
      </Typography>

      <View className="h-8" />
    </ScreenWrapper>
  );
}

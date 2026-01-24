import { useState } from 'react';
import { Alert, Image, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { PrescriptionVisionService } from '../../src/services/prescriptionVision.service';
import { usePrescriptionImport } from '../../src/contexts';

export default function PrescriptionImportScreen() {
  const { imageUri, setImageUri, setDrafts, reset } = usePrescriptionImport();
  const [isExtracting, setIsExtracting] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Camera permission is required to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      base64: true,
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
      quality: 0.8,
      base64: true,
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
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900 px-6 pt-14">
      <View className="flex-row items-center justify-between mb-4">
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
        Take a photo of your prescription and we’ll extract your medications for review.
      </Typography>

      <Card className="p-4 mb-4">
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={{ width: '100%', height: 280, borderRadius: 12 }} />
        ) : (
          <View className="h-72 items-center justify-center">
            <Typography variant="body" className="text-gray-500 dark:text-gray-400">
              No image selected
            </Typography>
          </View>
        )}

        <View className="flex-row gap-3 mt-4">
          <Button title="Camera" variant="primary" className="flex-1" onPress={pickFromCamera} />
          <Button title="Library" variant="outline" className="flex-1" onPress={pickFromLibrary} />
        </View>
      </Card>

      <Button
        title={isExtracting ? 'Extracting…' : 'Extract medications'}
        variant="primary"
        onPress={extract}
        disabled={!imageUri || isExtracting}
      />

      <Typography variant="small" className="text-gray-500 dark:text-gray-400 mt-3">
        Temporary: this sends the image directly to OpenAI for extraction.
      </Typography>
    </View>
  );
}

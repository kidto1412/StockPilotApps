import React, { useState } from 'react';
import { Image, Pressable, Text, View, Alert, Platform } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { UploadCloud } from 'lucide-react-native';
import Button from './Button';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

interface ImageUploadCardProps {
  onImageSelected?: (uri: string | null) => void; // <-- tambahkan props
}

export default function ImageUploadCard({
  onImageSelected,
}: ImageUploadCardProps) {
  const [imageUri, setImageUri] = useState<string | null>(null);

  async function requestPermissions() {
    if (Platform.OS === 'android') {
      const cameraPermission = await request(PERMISSIONS.ANDROID.CAMERA);
      const photoPermission = await request(
        PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
      );

      if (
        cameraPermission !== RESULTS.GRANTED &&
        photoPermission !== RESULTS.GRANTED
      ) {
        Alert.alert(
          'Permission required',
          'Please allow permissions in settings',
        );
        return false;
      }
    }
    return true;
  }

  const handleImage = (uri: string | null) => {
    setImageUri(uri);
    if (onImageSelected) onImageSelected(uri); // <-- kirim balik ke parent
  };

  const pickFromGallery = async () => {
    const granted = await requestPermissions();
    if (!granted) return;

    launchImageLibrary({ mediaType: 'photo', quality: 1 }, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Unknown error');
        return;
      }
      if (response.assets && response.assets.length > 0) {
        handleImage(response.assets[0].uri || null);
      }
    });
  };

  const openCamera = async () => {
    const granted = await requestPermissions();
    if (!granted) return;

    launchCamera({ mediaType: 'photo', quality: 1 }, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Unknown error');
        return;
      }
      if (response.assets && response.assets.length > 0) {
        handleImage(response.assets[0].uri || null);
      }
    });
  };

  return (
    <View className="w-full px-5 mb-5">
      <Pressable
        onPress={pickFromGallery}
        className="border border-dashed border-gray-400 rounded-xl p-6 bg-gray-50 items-center justify-center"
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            className="w-full h-48 rounded-lg"
            resizeMode="cover"
          />
        ) : (
          <>
            <UploadCloud size={40} color="#6C63FF" />
            <Text className="mt-3 text-blue-600 font-medium">
              Tap to upload photo
            </Text>
            <Text className="text-xs text-gray-500 mt-1">
              PNG, JPG max 800×400px
            </Text>
          </>
        )}
      </Pressable>

      <View className="flex-row items-center my-4">
        <View className="flex-1 h-px bg-gray-300" />
        <Text className="mx-3 text-gray-500">OR</Text>
        <View className="flex-1 h-px bg-gray-300" />
      </View>

      <Button
        onPress={openCamera}
        className="primary rounded-lg px-4 py-2 items-center"
        title="Buka Kamera"
      />
    </View>
  );
}

import React, { useState } from 'react';
import { Image, Pressable, Text, View, Alert, Platform } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Camera, ImagePlus, Trash2, UploadCloud } from 'lucide-react-native';
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
    <View className="w-full px-5 mb-6">
      <Text className="text-white font-medium mb-2">Foto Produk</Text>

      <View className="rounded-2xl border border-gray-700 bg-[#151515] p-3">
        <Pressable
          onPress={pickFromGallery}
          className="rounded-xl border border-dashed border-gray-500 bg-[#0f0f0f] items-center justify-center overflow-hidden"
          style={{ height: 220 }}
        >
          {imageUri ? (
            <View className="w-full h-full p-2">
              <Image
                source={{ uri: imageUri }}
                className="w-full h-full rounded-lg"
                resizeMode="contain"
              />
            </View>
          ) : (
            <View className="items-center px-5">
              <UploadCloud size={34} color="#9CA3AF" />
              <Text className="mt-2 text-gray-200 font-semibold text-center">
                Pilih foto produk
              </Text>
              <Text className="text-xs text-gray-400 mt-1 text-center">
                Preview akan ditampilkan proporsional tanpa terpotong
              </Text>
            </View>
          )}
        </Pressable>

        <View className="flex-row mt-3">
          <Pressable
            onPress={pickFromGallery}
            className="flex-1 rounded-xl bg-[#24382d] py-3 items-center justify-center mr-2 flex-row"
          >
            <ImagePlus size={16} color="#fff" />
            <Text className="text-white font-medium ml-2">Galeri</Text>
          </Pressable>

          <Pressable
            onPress={openCamera}
            className="flex-1 rounded-xl bg-green-500 py-3 items-center justify-center ml-2 flex-row"
          >
            <Camera size={16} color="#111" />
            <Text className="text-black font-semibold ml-2">Buka Kamera</Text>
          </Pressable>
        </View>

        {imageUri ? (
          <Pressable
            onPress={() => handleImage(null)}
            className="mt-3 rounded-xl border border-red-400 py-3 items-center justify-center flex-row"
          >
            <Trash2 size={16} color="#f87171" />
            <Text className="text-red-400 font-medium ml-2">Hapus Foto</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

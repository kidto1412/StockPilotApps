import React, { useState } from 'react';
import { Image, Pressable, Text, View, Alert } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ImageUploadCard() {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickFromGallery = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Unknown error');
        return;
      }
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri || null);
      }
    });
  };

  const openCamera = () => {
    launchCamera({ mediaType: 'photo', quality: 1 }, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Unknown error');
        return;
      }
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri || null);
      }
    });
  };

  return (
    <View className="w-full px-5 mb-5">
      {/* Container */}
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
            <Icon name="cloud-upload-outline" size={40} color="#6C63FF" />
            <Text className="mt-3 text-blue-600 font-medium">
              Tap to upload photo
            </Text>
            <Text className="text-xs text-gray-500 mt-1">
              PNG, JPG max 800×400px
            </Text>
          </>
        )}
      </Pressable>

      {/* Divider "OR" */}
      <View className="flex-row items-center my-4">
        <View className="flex-1 h-px bg-gray-300" />
        <Text className="mx-3 text-gray-500">OR</Text>
        <View className="flex-1 h-px bg-gray-300" />
      </View>

      {/* Open Camera Button */}
      <Pressable
        onPress={openCamera}
        className="bg-blue-700 rounded-lg px-4 py-2 items-center"
      >
        <Text className="text-white font-medium">Open camera</Text>
      </Pressable>
    </View>
  );
}

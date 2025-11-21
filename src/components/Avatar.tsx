import React from 'react';
import { View, Image, Text, Pressable } from 'react-native';

type AvatarProps = {
  size?: number; // ukuran diameter avatar
  imageUrl?: string; // url foto profil
  placeholder?: string; // huruf inisial jika tidak ada gambar
  onPress?: () => void; // aksi saat avatar ditekan
};

export default function Avatar({
  size = 50,
  imageUrl,
  placeholder = 'U',
  onPress,
}: AvatarProps) {
  return (
    <Pressable
      className="items-center justify-center bg-gray-200"
      style={{ width: size, height: size, borderRadius: size / 2 }}
      onPress={onPress}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-full"
          style={{ borderRadius: size / 2 }}
        />
      ) : (
        <Text className="text-white font-bold text-lg">
          {placeholder.charAt(0).toUpperCase()}
        </Text>
      )}
    </Pressable>
  );
}

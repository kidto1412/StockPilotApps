import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
interface Props {
  onPress: () => void;
  title: String;
}
export default function ButtonBottom({ onPress, title }: Props) {
  return (
    <View className="absolute bottom-4 left-4 right-4">
      <Pressable
        className="bg-green-500 rounded-2xl px-4 py-4 flex-row items-center justify-center"
        onPress={onPress}
      >
        <View className="flex-row items-center">
          <Text className="ml-2 font-semibold text-black">{title}</Text>
        </View>
      </Pressable>
    </View>
  );
}

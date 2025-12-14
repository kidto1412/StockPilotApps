import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';

export default function ProductCard({ item }: any) {
  return (
    <View className="w-1/2 p-2">
      <View className="bg-[#1B2A21] rounded-2xl p-3">
        <Image
          source={{ uri: item.image }}
          className="w-full h-24 rounded-xl mb-3"
          resizeMode="cover"
        />

        <Text className="text-white font-medium text-sm">{item.name}</Text>

        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-green-400 font-semibold">
            ${item.price.toFixed(2)}
          </Text>

          <View className="flex-row items-center bg-[#0F2215] rounded-full px-2 py-1">
            <Minus size={14} color="white" />
            <Text className="text-white mx-2 text-xs">2</Text>
            <Plus size={14} color="white" />
          </View>
        </View>
      </View>
    </View>
  );
}

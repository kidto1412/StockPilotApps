import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Plus } from 'lucide-react-native';

interface Props {
  onPress: () => void;
}

export default function QuickAction({ onPress }: Props) {
  return (
    <Pressable onPress={onPress} className="mt-5">
      <View className="bg-[#22F55E] rounded-2xl py-4 flex-row items-center justify-center">
        <Plus size={18} color="black" />
        <Text className="ml-2 font-semibold text-black">Penjualan</Text>
      </View>
    </Pressable>
  );
}

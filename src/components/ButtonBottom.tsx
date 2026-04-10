import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
interface Props {
  onPress: () => void;
  title: String;
  bottomOffset?: number;
}
export default function ButtonBottom({
  onPress,
  title,
  bottomOffset = 16,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute left-4 right-4"
      style={{ bottom: bottomOffset + insets.bottom }}
    >
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

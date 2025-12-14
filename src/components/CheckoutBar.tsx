import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';

export default function CheckoutBar() {
  return (
    <View className="absolute bottom-4 left-4 right-4">
      <Pressable className="bg-green-500 rounded-2xl px-4 py-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <ShoppingCart size={18} color="black" />
          <Text className="ml-2 font-semibold text-black">TOTAL</Text>
        </View>

        <View className="flex-row items-center">
          <Text className="font-bold text-black mr-3">$30.50</Text>
          <Text className="font-semibold text-black">Checkout →</Text>
        </View>
      </Pressable>
    </View>
  );
}

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';

interface CheckoutBarProps {
  amount: number;
  onPress: () => void;
  currency?: string;
  label?: string;
  disabled?: boolean;
}

export default function CheckoutBar({
  amount,
  onPress,
  currency = '$',
  label = 'Checkout',
  disabled = false,
}: CheckoutBarProps) {
  return (
    <View className="absolute bottom-4 left-4 right-4">
      <Pressable
        onPress={onPress}
        disabled={disabled}
        className={`rounded-2xl px-4 py-4 flex-row items-center justify-between
          ${disabled ? 'bg-gray-400' : 'bg-green-500'}`}
      >
        <View className="flex-row items-center">
          <ShoppingCart size={18} color="black" />
          <Text className="ml-2 font-semibold text-black">TOTAL</Text>
        </View>

        <View className="flex-row items-center">
          <Text className="font-bold text-black mr-3">
            {currency}
            {amount.toFixed(2)}
          </Text>
          <Text className="font-semibold text-black">{label} →</Text>
        </View>
      </Pressable>
    </View>
  );
}

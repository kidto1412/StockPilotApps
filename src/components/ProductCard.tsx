import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
import { getImageUrl } from '@/utils/getImage.util';
import { formatRupiah } from '@/utils/formatRupiah';

interface ProductCardProps {
  item: any;
  qty?: number;
  remainingStock?: number;
  onAdd?: () => void;
  onDecrease?: () => void;
}

export default function ProductCard({
  item,
  qty = 0,
  remainingStock,
  onAdd,
  onDecrease,
}: ProductCardProps) {
  const stockLeft =
    typeof remainingStock === 'number'
      ? remainingStock
      : Math.max(0, Number(item.stock ?? 0) - qty);

  return (
    <View className="w-1/2 p-2">
      <View className="bg-[#1B2A21] rounded-2xl p-3">
        <View className="rounded-xl mb-3 overflow-hidden bg-[#0F2215] border border-[#294134]">
          <Image
            source={{
              uri: item.imageUrl
                ? getImageUrl(item.imageUrl)
                : item.image || 'https://via.placeholder.com/300x200',
            }}
            className="w-full h-28"
            resizeMode="contain"
          />
        </View>

        <Text className="text-white font-medium text-sm">{item.name}</Text>
        <Text className="text-gray-400 text-xs mt-1">Stock: {stockLeft}</Text>

        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-green-400 font-semibold">
            {formatRupiah(item.price)}
          </Text>

          <View className="flex-row items-center bg-[#0F2215] rounded-full px-2 py-1">
            <Pressable onPress={onDecrease} hitSlop={8}>
              <Minus size={14} color="white" />
            </Pressable>
            <Text className="text-white mx-2 text-xs">{qty}</Text>
            <Pressable onPress={onAdd} hitSlop={8}>
              <Plus size={14} color="white" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

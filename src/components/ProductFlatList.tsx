import { formatRupiah } from '@/utils/formatRupiah';
import { Text, View } from 'react-native';

export function ProductItem({ item }: any) {
  const stockColor =
    item.status === 'low'
      ? 'text-orange-400'
      : item.status === 'out'
        ? 'text-red-400'
        : 'text-green-400';

  return (
    <View className="flex-row items-center bg-[#16251d] rounded-xl p-4 mb-3">
      {/* IMAGE */}
      <View className="w-12 h-12 bg-[#24382d] rounded-lg mr-4 items-center justify-center">
        <Text className="text-gray-500 text-xs">IMG</Text>
      </View>

      {/* INFO */}
      <View className="flex-1">
        <Text className="text-white font-semibold">{item.name}</Text>
        <Text className="text-xs text-gray-400">SKU: {item.sku}</Text>
        <Text className={`text-xs mt-1 ${stockColor}`}>{item.stock}</Text>
      </View>

      {/* PRICE */}
      <Text
        className={`font-semibold ${
          item.status === 'out' ? 'text-gray-500' : 'text-green-400'
        }`}
      >
        {formatRupiah(item.price)}
      </Text>
    </View>
  );
}

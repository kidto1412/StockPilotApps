import { ProductResponse } from '@/interfaces/product.interface';
import { formatRupiah } from '@/utils/formatRupiah';
import { Edit, Trash2 } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';

interface ProductItemProps {
  item: ProductResponse;
  onEdit: (product: ProductResponse) => void;
  onDelete: (product: ProductResponse) => void;
}
export function ProductItem({ item, onDelete, onEdit }: ProductItemProps) {
  // const stockColor =
  //   item.status === 'low'
  //     ? 'text-orange-400'
  //     : item.status === 'out'
  //       ? 'text-red-400'
  //       : 'text-green-400';

  return (
    <View className=" bg-[#16251d] rounded-xl p-4 mb-3 mx-5">
      <View className="flex-row items-center px-5">
        {/* IMAGE */}
        <View className="w-12 h-12 bg-[#24382d] rounded-lg mr-4 items-center justify-center">
          <Text className="text-gray-500 text-xs">IMG</Text>
        </View>

        {/* INFO */}
        <View className="flex-1">
          <Text className="text-white font-semibold">{item.name}</Text>
          <Text className="text-xs text-gray-400">SKU: {item.sku}</Text>
          <Text className={`text-xs mt-1 text-white`}>{item.stock}</Text>
        </View>

        {/* PRICE */}
        <Text className={`font-semibold ${'text-green-400'}`}>
          {formatRupiah(item.price)}
        </Text>
      </View>
      <View className="flex-row space-x-4 mt-4 px-5 ">
        <TouchableOpacity
          onPress={() => onEdit(item)}
          className="flex-row items-center px-3 py-2 bg-blue-100 rounded-xl"
        >
          <Edit size={18} color="#2563eb" />
          <Text className="ml-1 text-blue-600 font-semibold">Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onDelete(item)}
          className="flex-row items-center px-3 py-2 bg-red-100 rounded-xl ml-2"
        >
          <Trash2 size={18} color="#dc2626" />
          <Text className="ml-2 text-red-600 font-semibold">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

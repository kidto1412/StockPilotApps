import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // <- tambahkan ini
import {
  ShoppingCart,
  Box,
  Users,
  User,
  Package,
  BarChart2,
  Tag,
  Store,
} from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/types/navigation.type';

type IconType = React.FC<{ size?: number; color?: string }>;

interface MenuItemProps {
  label: string;
  icon: IconType;
  onPress: () => void;
}

type RouteName = keyof MainStackParamList;

const MenuItem = ({ label, icon: Icon, onPress }: MenuItemProps) => (
  <Pressable onPress={onPress} className="w-1/2 p-2">
    <View className="flex-row items-center gap-3 bg-[#1B2A21] rounded-2xl px-4 py-5 shadow">
      {/* Icon */}
      <View className="w-10 h-10 rounded-xl bg-[#22362A] items-center justify-center">
        <Icon size={20} color="#22C55E" />
      </View>

      {/* Text */}
      <Text className="text-white font-semibold text-sm">{label}</Text>
    </View>
  </Pressable>
);

export default function CategoryMenu() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const menu: { label: string; icon: IconType; path: RouteName }[] = [
    { label: 'Penjualan', icon: ShoppingCart, path: 'Sales' },
    { label: 'Penyimpanan', icon: Box, path: 'Product' },
    { label: 'Pelanggan', icon: Users, path: 'Customer' },
    { label: 'Pegawai', icon: User, path: 'Employe' },
    { label: 'Produk', icon: Package, path: 'Product' },
    { label: 'Laporan', icon: BarChart2, path: 'Report' },
    { label: 'Category', icon: Tag, path: 'Category' },
    { label: 'Diskon', icon: Store, path: 'Discount' },
  ];

  return (
    <View className="px-4 mt-4">
      {/* Title */}
      <Text className="text-white text-lg font-bold mb-3">Management</Text>

      {/* Grid */}
      <View className="flex-row flex-wrap -mx-2">
        {menu.map((item, index) => (
          <MenuItem
            key={index}
            label={item.label}
            icon={item.icon}
            onPress={() => navigation.navigate(item.path)}
          />
        ))}
      </View>
    </View>
  );
}

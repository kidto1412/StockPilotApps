import React from 'react';
import { Pressable, View, Text } from 'react-native';
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

interface ItemProps {
  label: string;
  icon: React.FC<{ size?: number; color?: string }>;
  onPress?: () => void;
}

const MenuItem = ({ label, icon: Icon, onPress }: ItemProps) => (
  <Pressable onPress={onPress} className="w-1/2 p-2">
    <View className="bg-white rounded-xl p-5 shadow flex items-center justify-center">
      <Icon size={32} color="#6C63FF" />
      <Text className="mt-2 text-base font-medium text-gray-700">{label}</Text>
    </View>
  </Pressable>
);

interface CategoryMenuProps {
  onNavigate?: (path: string) => void;
}

export default function CategoryMenu({ onNavigate }: CategoryMenuProps) {
  const menu: {
    label: string;
    icon: React.FC<{ size?: number; color?: string }>;
    path: string;
  }[] = [
    { label: 'Penjualan', icon: ShoppingCart, path: 'sales' },
    { label: 'Penyimpanan', icon: Box, path: 'storage' },
    { label: 'Pelanggan', icon: Users, path: 'customer' },
    { label: 'Pegawai', icon: User, path: 'employee' },
    { label: 'Produk', icon: Package, path: 'product' },
    { label: 'Laporan', icon: BarChart2, path: 'report' },
    { label: 'Category', icon: Tag, path: 'category' },
    { label: 'Store', icon: Store, path: 'store' },
  ];

  return (
    <View className="p-2">
      <View className="flex flex-row flex-wrap -mx-2">
        {menu.map((item, index) => (
          <MenuItem
            key={index}
            label={item.label}
            icon={item.icon}
            onPress={() => onNavigate?.(item.path)}
          />
        ))}
      </View>
    </View>
  );
}

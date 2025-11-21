import React from 'react';
import { Pressable, View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ItemProps {
  label: string;
  icon: string;
  onPress?: () => void;
}

const MenuItem = ({ label, icon, onPress }: ItemProps) => (
  <Pressable onPress={onPress} className="w-1/2 p-2">
    <View className="bg-white rounded-xl p-5 shadow flex items-center justify-center">
      <Ionicons name={icon} size={32} color="#6C63FF" />
      <Text className="mt-2 text-base font-medium text-gray-700">{label}</Text>
    </View>
  </Pressable>
);

interface CategoryMenuProps {
  onNavigate?: (path: string) => void;
}

export default function CategoryMenu({ onNavigate }: CategoryMenuProps) {
  const menu = [
    { label: 'Penjualan', icon: 'cart-outline', path: 'sales' },
    { label: 'Penyimpanan', icon: 'cube-outline', path: 'storage' },
    { label: 'Pelanggan', icon: 'people-outline', path: 'customer' },
    { label: 'Pegawai', icon: 'person-outline', path: 'employee' },
    { label: 'Produk', icon: 'albums-outline', path: 'product' },
    { label: 'Laporan', icon: 'bar-chart-outline', path: 'report' },
    { label: 'Category', icon: 'bar-chart-outline', path: 'category' },
    { label: 'Store', icon: 'bar-chart-outline', path: 'store' },
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

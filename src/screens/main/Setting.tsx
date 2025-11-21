import React from 'react';
import { ScrollView, View, Pressable, Text } from 'react-native';
import Avatar from '@/components/avatar';

export default function AccountScreen() {
  const menuItems = [
    { label: 'Ubah Akun', icon: '👤' },
    { label: 'Riwayat Transaksi', icon: '📄' },
    { label: 'Pengaturan', icon: '⚙️' },
    { label: 'Bantuan', icon: '💡' },
    { label: 'Kebijakan Pribadi', icon: '📜' },
    { label: 'Syarat dan Ketentuan', icon: '📘' },
  ];

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="w-full py-4 border-b border-gray-200">
        <Text className="text-xl font-semibold text-center">Akun Saya</Text>
      </View>

      {/* Profile Card */}
      <View className="mx-4 mt-5 bg-indigo-500 rounded-2xl p-6 items-center">
        <Avatar
          size={60}
          imageUrl="https://example.com/avatar.jpg"
          placeholder="F"
          onPress={() => console.log('Avatar clicked')}
        />
        <Text className="text-white text-sm mt-2">Kasir</Text>
        <Text className="text-white font-semibold text-lg mt-1">
          Alex Parkinson
        </Text>
      </View>

      {/* Menu List */}
      <View className="mx-4 mt-5 bg-white rounded-xl shadow border border-gray-100">
        {menuItems.map((item, index) => (
          <View key={index}>
            <Pressable className="flex-row items-center justify-between px-4 py-4">
              <View className="flex-row items-center space-x-4">
                <Text className="text-lg">{item.icon}</Text>
                <Text className="text-base">{item.label}</Text>
              </View>
              <Text className="text-xl text-gray-400">{'>'}</Text>
            </Pressable>
            {index !== menuItems.length - 1 && (
              <View className="h-px bg-gray-200" />
            )}
          </View>
        ))}
      </View>

      {/* Logout Button */}
      <Pressable className="mx-4 mt-5 bg-white border border-gray-200 rounded-xl py-4 px-4 flex-row items-center justify-between">
        <View className="flex-row items-center space-x-4">
          <Text className="text-lg">🚪</Text>
          <Text className="text-base text-red-500 font-semibold">Keluar</Text>
        </View>
        <Text className="text-xl text-gray-400">{'>'}</Text>
      </Pressable>

      <View className="h-10" />
    </ScrollView>
  );
}

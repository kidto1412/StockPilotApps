import React from 'react';
import { SafeAreaView, View, Text, Pressable } from 'react-native';
import Badge from '@/components/Badge';
import Menu from '@/components/Menu';
import { ShoppingCart } from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth.store';

export default function HomePage() {
  return (
    <SafeAreaView className="flex-1 p-5 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        {/* Left Section */}
        <View className="flex-row items-center">
          <View className="ml-3">
            <Text className="text-base font-semibold text-gray-900">
              Stephanie Sharkey
            </Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-sm text-gray-500">Cashier</Text>
            </View>
          </View>
        </View>

        {/* Notification Icon */}
        <View className="relative">
          <ShoppingCart size={24} color="black" />

          <View
            style={{ position: 'absolute', top: -4, right: 10, zIndex: 10 }}
          >
            <Badge count={3} size={18} color="red" />
          </View>
        </View>
      </View>

      {/* Menu */}
      <View className="mt-5">
        <Menu />
      </View>
    </SafeAreaView>
  );
}

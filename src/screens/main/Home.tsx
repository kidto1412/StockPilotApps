import React from 'react';
import { SafeAreaView, View, Text, Pressable, ScrollView } from 'react-native';
import Badge from '@/components/Badge';
import Menu from '@/components/Menu';
import { ShoppingCart } from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth.store';
import { useUserState } from '@/stores/user.store';
import Screen from '@/components/Screen';
import HomeStats from '@/components/HomeStat';
import QuickAction from '@/components/QuickAction';

export default function HomePage() {
  const profile = useUserState(s => s.profile);
  return (
    <Screen className="flex-1 p-5 ">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        {/* Left Section */}
        <View className="flex-row items-center">
          <View className="ml-3">
            <Text className="text-base font-semibold text-white">
              {profile?.fullName}
            </Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-sm text-white"> {profile?.role}</Text>
            </View>
          </View>
        </View>

        {/* Notification Icon */}
        <View className="relative">
          <ShoppingCart size={24} color="white" />

          <View
            style={{ position: 'absolute', top: -4, right: 10, zIndex: 10 }}
          >
            <Badge count={3} size={18} color="red" />
          </View>
        </View>
      </View>

      {/* Menu */}
      <ScrollView>
        <View className="mt-5">
          <HomeStats />
          <QuickAction onPress={() => console.log('NEW SALE')} />
          <Menu />
        </View>
      </ScrollView>
    </Screen>
  );
}

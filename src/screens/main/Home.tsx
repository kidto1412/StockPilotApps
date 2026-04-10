import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Badge from '@/components/Badge';
import Menu from '@/components/Menu';
import { Icon, ShoppingCart, Menu as MenuIcon } from 'lucide-react-native';

import { useAuthStore } from '@/stores/auth.store';
import { useUserState } from '@/stores/user.store';
import Screen from '@/components/Screen';
import HomeStats from '@/components/HomeStat';
import QuickAction from '@/components/QuickAction';
import { BOTTOM_NAV_HEIGHT } from '@/constants/height.constant';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerParamList } from '@/types/navigation.type';
import DrawerHeaderLeft from '@/components/DrawerHeaderLeft';

export default function HomePage() {
  const profile = useUserState(s => s.profile);
  const insets = useSafeAreaInsets();
  type HomeNavProp = DrawerNavigationProp<DrawerParamList, 'Home'>;
  const navigation = useNavigation<HomeNavProp>();

  return (
    <Screen className="flex-1 p-5 ">
      {/* Header */}

      <View className="flex-row items-center justify-between">
        {/* Left Section */}
        <View className="flex-row items-center">
          {/* <View>
            <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
              <MenuIcon size={28} color="#fff" />
            </TouchableOpacity>
          </View> */}
          <View className="ml-5">
            <Text className="text-base font-semibold text-white">
              {profile?.fullName}
            </Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-sm text-white"> {profile?.role}</Text>
            </View>
          </View>
        </View>

        {/* Notification Icon */}
        {/* <View className="relative">
          <ShoppingCart size={24} color="white" />

          <View
            style={{ position: 'absolute', top: -4, right: 10, zIndex: 10 }}
          >
            <Badge count={3} size={18} color="red" />
          </View>
        </View> */}
      </View>

      {/* Menu */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: BOTTOM_NAV_HEIGHT + insets.bottom + 16,
        }}
      >
         
        <View className="mt-5">
          <HomeStats />
          <QuickAction onPress={() => console.log('NEW SALE')} />
          <Menu />
        </View>
      </ScrollView>
    </Screen>
  );
}

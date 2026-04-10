import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Clock, BarChart3, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BOTTOM_NAV_HEIGHT } from '@/constants/height.constant';

const icons: Record<string, any> = {
  Home: Home,
  History: Clock,
  Report: BarChart3,
  Settings: Settings,
};

export default function BottomNavigation({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingBottom: insets.bottom,
        height: BOTTOM_NAV_HEIGHT + insets.bottom,
      }}
      className="base border-t border-gray-600"
    >
      <View className="flex-row justify-around py-2">
        {state.routes.map((route, index) => {
          const isActive = state.index === index;
          const Icon = icons[route.name];

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              className="items-center"
            >
              {Icon && (
                <Icon size={24} color={isActive ? '#22C55E' : '#9CA3AF'} />
              )}
              <Text
                className={`text-xs ${
                  isActive ? 'text-primary' : 'text-gray-400'
                }`}
              >
                {descriptors[route.key].options.title ?? route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Clock, BarChart3, Settings } from 'lucide-react-native';

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
  return (
    <View className="flex-row justify-around base py-2 border-t border-gray-600">
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
              className={`text-xs ${isActive ? 'text-primary' : 'text-gray-400'}`}
            >
              {descriptors[route.key].options.title ?? route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

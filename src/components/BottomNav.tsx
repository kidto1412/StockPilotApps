import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Home, Bell, User } from 'lucide-react-native';

type Tab = {
  name: string;
  icon: React.FC<{ size?: number; color?: string }>;
};

type BottomNavigationProps = {
  // Jika pakai react-navigation, bisa tambahkan navigation props
  navigation?: any;
};

const BottomNavigation: React.FC<BottomNavigationProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<string>('Home');

  const tabs: Tab[] = [
    { name: 'Home', icon: Home },
    { name: 'Notifications', icon: Bell },
    { name: 'Profile', icon: User },
  ];

  return (
    <View className="flex-row justify-around bg-white py-2 border-t border-gray-200">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            className="items-center"
            onPress={() => {
              setActiveTab(tab.name);
              // navigation?.navigate(tab.name); // jika pakai react-navigation
            }}
          >
            <Icon size={24} color={isActive ? '#3B82F6' : '#9CA3AF'} />
            <Text
              className={`text-xs ${isActive ? 'text-blue-500' : 'text-gray-400'}`}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNavigation;

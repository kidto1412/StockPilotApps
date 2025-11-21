import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import {
  Building,
  Building2,
  Home,
  Hotel,
  Landmark,
} from 'lucide-react-native';

export default function CategoryScroll() {
  const categories = [
    { id: 1, label: 'Hotel', icon: Hotel },
    { id: 2, label: 'Apart', icon: Building2 },
    { id: 3, label: 'Motel', icon: Building },
    { id: 4, label: 'Resort', icon: Landmark },
    { id: 5, label: 'Villa', icon: Home },
    { id: 6, label: 'Volly', icon: Home },
    { id: 7, label: 'Billiard', icon: Home },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      className="mt-3"
    >
      <View className="flex-row">
        {categories.map(item => {
          const IconComponent = item.icon;
          return (
            <View key={item.id} className="items-center mx-3">
              <View className="w-14 h-14 bg-gray-100 rounded-2xl items-center justify-center mb-1">
                <IconComponent color="black" size={28} />
              </View>
              <Text className="text-sm text-gray-700">{item.label}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

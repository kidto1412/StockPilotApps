import React from 'react';
import { ScrollView, Text, Pressable, View } from 'react-native';
import { ChevronDown, SlidersHorizontal } from 'lucide-react-native';

export default function FilterScroll() {
  const filters = [
    { id: 1, label: 'Pupuk A', icon: SlidersHorizontal },
    { id: 2, label: 'Pupuk B', icon: ChevronDown },
    { id: 3, label: 'Pupuk C', icon: ChevronDown },
    { id: 4, label: 'Pupuk D', icon: ChevronDown },
    { id: 5, label: 'Pupuk E', icon: ChevronDown },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      className="mt-3"
    >
      <View className="flex-row space-x-3">
        {filters.map(item => {
          const IconComponent = item.icon;

          return (
            <Pressable
              key={item.id}
              className="flex-row items-center px-4 py-2 rounded-full border border-gray-300 bg-white"
            >
              {item.id === 1 && (
                <IconComponent size={16} color="black" className="mr-1" />
              )}
              <Text className="text-gray-800 text-sm font-medium">
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

import React from 'react';
import { View, Text, Pressable } from 'react-native';

const categories = ['All', 'Beverages', 'Produce'];

export default function CategoryFilter() {
  return (
    <View className="flex-row mt-3">
      {categories.map((item, i) => (
        <Pressable
          key={i}
          className={`px-4 py-2 mr-2 rounded-full ${
            i === 0 ? 'bg-green-500' : 'bg-[#1B2A21]'
          }`}
        >
          <Text
            className={`text-sm ${
              i === 0 ? 'text-black font-semibold' : 'text-gray-300'
            }`}
          >
            {item}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

import React from 'react';
import { View, Text } from 'react-native';

type BadgeProps = {
  count?: number; // untuk badge angka
  dot?: boolean; // jika hanya dot kecil
  size?: number; // diameter dot atau tinggi badge
  color?: string; // warna badge
  textColor?: string; // warna teks
};

export default function Badge({
  count,
  dot = false,
  size = 16,
  color = 'red',
  textColor = 'white',
}: BadgeProps) {
  if (dot) {
    return (
      <View
        className="absolute rounded-full"
        style={{ width: size, height: size, backgroundColor: color }}
      />
    );
  }

  return (
    <View
      className="absolute rounded-full items-center justify-center px-2"
      style={{
        minWidth: size,
        height: size,
        backgroundColor: color,
        paddingHorizontal: count && count > 9 ? 6 : 0,
      }}
    >
      <Text
        className="text-white font-bold text-xs"
        style={{ color: textColor }}
      >
        {count}
      </Text>
    </View>
  );
}

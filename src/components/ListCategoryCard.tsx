import React from 'react';
import { ScrollView, Text, View, Image } from 'react-native';

export default function ListCategoryCard() {
  const hotels = [
    {
      id: 1,
      name: 'Solstice Royale',
      image:
        'https://images.unsplash.com/photo-1576675784426-c9c9a7f2f8b1?auto=format&fit=crop&w=800&q=60',
      rating: 4.5,
      reviews: 423,
      price: '$170 - $495/night',
      address: 'Jl. Babakansari wetan St No.153, Bogor',
    },
    {
      id: 2,
      name: 'Celestine Haven',
      image:
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=60',
      rating: 4.9,
      reviews: 345,
      price: '$725 - $820/night',
      address: 'Jl. Sritanjung Utara No.11, Ngagelrejo, Surabaya',
    },
    {
      id: 3,
      name: 'Tropicana Bliss',
      image:
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=60',
      rating: 4.7,
      reviews: 546,
      price: '$530 - $950/night',
      address: 'Jl. Panda Putih No.163-165, Bogor Barat',
    },
  ];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16 }}
    >
      {hotels.map(hotel => (
        <View
          key={hotel.id}
          className="mb-5 bg-white rounded-2xl p-3 shadow-sm flex-row"
        >
          {/* Gambar hotel */}
          <View className="w-24 h-24 rounded-xl overflow-hidden bg-gray-200">
            <Image
              source={{ uri: hotel.image }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          {/* Detail hotel */}
          <View className="flex-1 justify-center ml-3">
            <Text className="text-base font-semibold text-gray-900">
              {hotel.name}
            </Text>

            <Text className="text-sm text-gray-500 mt-1">
              ({hotel.reviews} reviews)
            </Text>

            <Text className="text-sm text-gray-700 mt-1">{hotel.price}</Text>
            <Text className="text-xs text-gray-500 mt-1">{hotel.address}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

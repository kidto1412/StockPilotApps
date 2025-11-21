import FilterScroll from '@/components/FilterScroll';
import VerticalProduct from '@/components/VerticalProduct';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

import { View, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/Button'; // import button custom

export default function ProductPage() {
  const [search, setSearch] = useState('');
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Tombol Tambah Produk */}
      <View className="items-start px-5 mb-5">
        <Button
          title="Tambah Produk"
          color="primary"
          onPress={() => {
            // nanti bisa tambahkan navigation di sini
            // contoh: navigation.navigate('AddProductPage');
          }}
        />
      </View>

      {/* Search Input */}
      <View className="px-5 mb-4">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search..."
          className="bg-white rounded-lg px-4 py-3 text-gray-800"
        />
      </View>

      {/* Filter Scroll */}
      <FilterScroll />

      {/* Daftar Produk */}
      <VerticalProduct />
    </SafeAreaView>
  );
}

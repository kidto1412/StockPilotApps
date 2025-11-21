import FilterScroll from '@/components/FilterScroll';
import VerticalProduct from '@/components/VerticalProduct';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '@/components/Input'; // import input custom
import { useState } from 'react';

export default function SalesPage() {
  const [search, setSearch] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="pt-5">
        {/* Input Search */}
        <Input
          placeholder="Search..."
          value={search}
          onChangeText={setSearch}
          className="mx-5"
          type="text"
        />

        {/* Filter Scroll */}
        <FilterScroll />

        {/* Daftar Produk */}
        <VerticalProduct />
      </View>
    </SafeAreaView>
  );
}

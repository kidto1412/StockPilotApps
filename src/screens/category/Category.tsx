import React from 'react';
import { SafeAreaView, View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Button from '@/components/button';
import Input from '@/components/input';
import ListCategoryCard from '@/components/ListCategoryCard';

export default function CategoryPage() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Button Tambah Kategori */}
        <View className="px-5 py-4 mb-5">
          <Button title="Tambah Kategori" color="primary" />
        </View>

        {/* Search Input */}
        <View className="px-5 mb-5">
          <Input placeholder="Search..." />
        </View>

        {/* List Kategori */}
        <View className="px-5">
          <ListCategoryCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

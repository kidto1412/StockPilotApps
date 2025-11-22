import React from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { Text } from 'react-native';

export default function ProductFormPage() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="bg-white">
          <Text className="font-bold text-lg ml-1 p-5">Form Kategori</Text>

          <View className="px-5 mb-5">
            <Input placeholder="Name" className="mb-5" />
            <Input placeholder="SKU" className="mb-5" />
            <Input placeholder="Barcode" className="mb-5" />
            <Input placeholder="Cost" className="mb-5" />
            <Input placeholder="Price" className="mb-5" />
            <Input placeholder="Stock" className="mb-5" />
            <Input placeholder="Description" className="mb-5" />
          </View>

          {/* Button Simpan */}
          <View className="px-5 mb-5">
            <Button
              title="Simpan"
              color="primary"
              onPress={() => console.log('Simpan clicked')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

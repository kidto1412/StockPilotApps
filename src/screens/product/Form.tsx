import Button from '@/components/button';

import ImageUploadCard from '@/components/ImagePicker';

import Input from '@/components/input';

import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProductFormPage() {
  return (
    <SafeAreaView>
      <ScrollView>
        <View className="bg-white">
          <Text className="font-bold ml-1 p-5">Form Produk</Text>
          <View>
            <ImageUploadCard />
          </View>
          <View className="px-5 mb-5">
            <Input placeholder="Name" className="bg-white rounded-lg mb-5" />
            <Input placeholder="SKU" className="bg-white rounded-lg mb-5" />
            <Input placeholder="Barcode" className="bg-white rounded-lg mb-5" />
            <Input placeholder="Cost" className="bg-white rounded-lg mb-5" />
            <Input placeholder="Price" className="bg-white rounded-lg mb-5" />
            <Input placeholder="Stock" className="bg-white rounded-lg mb-5" />
          </View>
          <View className="px-5 mb-5">
            <Button
              title="Simpan"
              color="primary"
              onPress={() => console.log('Simpan')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

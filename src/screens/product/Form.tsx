import Button from '@/components/Button';
import ButtonBottom from '@/components/ButtonBottom';

import ImageUploadCard from '@/components/ImagePicker';

import Input from '@/components/Input';
import Screen from '@/components/Screen';
import { useProduct } from '@/hooks/products/useProduct';
import { useState } from 'react';

import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProductFormPage() {
  const { create } = useProduct();

  // 🔥 STATE FORM
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [cost, setCost] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState<any>(null);
  const [categoryId, setCategoryId] = useState<string | undefined>();
  // 🔥 SUBMIT
  const handleSubmit = () => {
    create(
      {
        name,
        sku,
        barcode,
        cost: Number(cost),
        price: Number(price),
        stock: Number(stock),
        categoryId,
      },
      image,
    );
  };
  return (
    <Screen>
      <ScrollView>
        <Text className="font-bold ml-1 p-5 text-white">Form Produk</Text>
        <View>
          <ImageUploadCard onImageSelected={img => setImage(img)} />
        </View>
        <View className="px-5 mb-5">
          <Input
            placeholder="Name"
            value={name}
            onChangeText={setName}
            className="bg-white rounded-lg mb-5"
          />
          <Input
            placeholder="SKU"
            value={sku}
            onChangeText={setSku}
            className="bg-white rounded-lg mb-5"
          />
          <Input
            placeholder="Barcode"
            value={barcode}
            onChangeText={setBarcode}
            className="bg-white rounded-lg mb-5"
          />
          <Input
            placeholder="Cost"
            value={cost}
            onChangeText={setCost}
            keyboardType="numeric"
            className="bg-white rounded-lg mb-5"
          />
          <Input
            placeholder="Price"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            className="bg-white rounded-lg mb-5"
          />
          <Input
            placeholder="Stock"
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
            className="bg-white rounded-lg mb-16"
          />
        </View>
      </ScrollView>
      <ButtonBottom title={'Tambah Produk'} onPress={handleSubmit} />
    </Screen>
  );
}

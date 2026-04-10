import Button from '@/components/Button';
import ButtonBottom from '@/components/ButtonBottom';
import CurrencyInput from '@/components/CurrencyInput';
import Dialog from '@/components/Dialog';

import ImageUploadCard from '@/components/ImagePicker';

import Input from '@/components/Input';
import Screen from '@/components/Screen';
import SelectBox from '@/components/SelectBox';
import { useCategory } from '@/hooks/category/useCategory';
import { useProduct } from '@/hooks/products/useProduct';
import { CategoryResponse } from '@/interfaces/category.interface';
import { useProductStore } from '@/stores/product.store';
import { Scan } from 'lucide-react-native';
import { useEffect, useState } from 'react';

import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProductFormPage() {
  const { create } = useProduct();
  const { product } = useProductStore();
  // 🔥 STATE FORM
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [cost, setCost] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState<any>(null);
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [categories, setCategories] = useState<
    { label: string; value: string | number }[]
  >([]);
  const [openDialog, setOpenDialog] = useState(false);
  const categoryHook = useCategory();

  const fetchCategory = async () => {
    const data = await categoryHook.getAll();

    if (!data) return;
    setCategories(
      data.map((item: CategoryResponse) => ({
        label: item.name,
        value: item.id,
      })),
    );
  };
  // 🔥 SUBMIT
  const handleSubmit = async () => {
    console.log(image);
    try {
      await create(
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
    } catch (error) {
      console.log(error);
    }
  };
  const handleScan = () => {
    console.log('scann');
  };

  useEffect(() => {
    if (!product) return;

    setName(product.name ?? '');
    setSku(product.sku ?? '');
    setBarcode(product.barcode ?? '');
    setCost(product.cost ? product.cost.toString() : '');
    setPrice(product.price ? product.price.toString() : '');
    setStock(product.stock ? product.stock.toString() : '');
    setCategoryId(product.categoryId ?? '');

    // kalau image dari server
    if (product.imageUrl) {
      setImage({
        uri: product.imageUrl,
      });
    }
  }, [product]);

  return (
    <Screen>
      <ScrollView className="mb-16">
        <Text className="font-bold ml-1 p-5 text-white">Form Produk</Text>
        <View style={{ alignItems: 'flex-start' }} className="ml-5 mb-5">
          <Button title="Supplier" onPress={() => setOpenDialog(true)}></Button>
        </View>
        <Dialog
          visible={openDialog}
          title="Supplier"
          message="Pilih supplier atau tambah supplier baru"
          onClose={() => setOpenDialog(false)}
          onConfirm={() => {
            console.log('Confirm clicked');
            setOpenDialog(false);
          }}
          confirmText="Pilih"
          cancelText="Tutup"
        >
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
              suffixIcon={<Scan className="text-white" color={'white'}></Scan>}
              onSuffixPress={handleScan}
            />
            <CurrencyInput
              placeholder="Harga Dasar"
              value={cost}
              onChangeValue={setCost}
              className="bg-white rounded-lg mb-5"
            />
            <CurrencyInput
              placeholder="Harga Jual"
              value={price}
              onChangeValue={setPrice}
              className="bg-white rounded-lg mb-5"
            />
            <Input
              placeholder="Stock"
              value={stock}
              onChangeText={setStock}
              keyboardType="numeric"
              className="bg-white rounded-lg mb-16"
            />
            <SelectBox
              placeholder="Kategori"
              selectedValue={categoryId}
              onValueChange={text => setCategoryId(text.toString())}
              options={categories}
              onOpen={fetchCategory}
              className="mb-5"
            />
          </View>
        </Dialog>
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
            suffixIcon={<Scan className="text-white" color={'white'}></Scan>}
            onSuffixPress={handleScan}
          />
          <CurrencyInput
            placeholder="Harga Dasar"
            value={cost}
            onChangeValue={setCost}
            className="bg-white rounded-lg mb-5"
          />
          <CurrencyInput
            placeholder="Harga Jual"
            value={price}
            onChangeValue={setPrice}
            className="bg-white rounded-lg mb-5"
          />
          <Input
            placeholder="Stock"
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
            className="bg-white rounded-lg mb-16"
          />
          <SelectBox
            placeholder="Kategori"
            selectedValue={categoryId}
            onValueChange={text => setCategoryId(text.toString())}
            options={categories}
            onOpen={fetchCategory}
            className="mb-5"
          />
        </View>
      </ScrollView>
      <ButtonBottom title={'Tambah Produk'} onPress={handleSubmit} />
    </Screen>
  );
}

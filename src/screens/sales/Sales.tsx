import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import Screen from '@/components/Screen';
import Input from '@/components/Input';
import ProductCard from '@/components/ProductCard';
import CheckoutBar from '@/components/CheckoutBar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/types/navigation.type';
import { useProduct } from '@/hooks/products/useProduct';
import { useSalesCartStore } from '@/stores/sales-cart.store';
import { ProductResponse } from '@/interfaces/product.interface';
import { useToastMessage } from '@/providers/toast.provider';
import { useCategory } from '@/hooks/category/useCategory';
import { CategoryResponse } from '@/interfaces/category.interface';

// import SearchBar from '@/components/sales/SearchBar';
// import CategoryFilter from '@/components/sales/CategoryFilter';
// import ProductCard from '@/components/sales/ProductCard';
// import CheckoutBar from '@/components/sales/CheckoutBar';

export default function SalesPage() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { getProductPagination } = useProduct();
  const { getAll: getAllCategory } = useCategory();
  const { addItem, decreaseQty, getQty, items } = useSalesCartStore();
  const { showToast } = useToastMessage();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter(product => {
    const matchesCategory =
      selectedCategoryId === 'ALL' || product.categoryId === selectedCategoryId;
    const matchesSearch = product.name
      ?.toLowerCase()
      .includes(search.trim().toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );

  const fetchProducts = async () => {
    const data = await getProductPagination({ page: 1, size: 50 });
    if (!data) return;
    setProducts(data.content);
  };

  const fetchCategories = async () => {
    const data = await getAllCategory();
    if (!data) return;
    setCategories(data);
  };

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
      fetchProducts();
    }, []),
  );

  const onAddSalesItem = (item: ProductResponse) => {
    const success = addItem(item);
    if (!success) {
      showToast('Stok tidak mencukupi', 'error');
    }
  };

  return (
    <Screen className="flex-1 base">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        className="px-4"
      >
        {/* Search */}
        <Input
          className="mt-5"
          value={search}
          onChangeText={setSearch}
          placeholder="Cari produk..."
        />

        {/* Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 8 }}
          className="mb-2"
        >
          <Pressable
            onPress={() => setSelectedCategoryId('ALL')}
            className={`mr-2 px-4 h-10 rounded-xl border items-center justify-center ${
              selectedCategoryId === 'ALL'
                ? 'bg-green-600 border-green-500'
                : 'bg-[#1d1d1d] border-gray-700'
            }`}
            style={{ minWidth: 90 }}
          >
            <Text
              className={`font-medium ${
                selectedCategoryId === 'ALL' ? 'text-white' : 'text-gray-100'
              }`}
            >
              Semua
            </Text>
          </Pressable>

          {categories.map(category => {
            const isActive = selectedCategoryId === category.id;
            return (
              <Pressable
                key={category.id}
                onPress={() => setSelectedCategoryId(category.id)}
                className={`mr-2 px-4 h-10 rounded-xl border items-center justify-center ${
                  isActive
                    ? 'bg-green-600 border-green-500'
                    : 'bg-[#1d1d1d] border-gray-700'
                }`}
                style={{ minWidth: 100, maxWidth: 160 }}
              >
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  className={`font-medium ${isActive ? 'text-white' : 'text-gray-100'}`}
                >
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Section */}
        <View className="mt-4 mb-2">
          <Text className="text-white font-semibold text-lg">Most Popular</Text>
          <Text className="text-gray-400 text-xs">
            {filteredProducts.length} items
          </Text>
        </View>

        {/* Product Grid */}
        <View className="flex-row flex-wrap -mx-2">
          {filteredProducts.map(item => (
            <ProductCard
              key={item.id}
              item={item}
              qty={getQty(item.id)}
              remainingStock={Math.max(0, item.stock - getQty(item.id))}
              onAdd={() => onAddSalesItem(item)}
              onDecrease={() => decreaseQty(item.id)}
            />
          ))}

          {filteredProducts.length === 0 ? (
            <Text className="text-center text-gray-500 w-full mt-8">
              Tidak ada produk sesuai filter
            </Text>
          ) : null}
        </View>
      </ScrollView>

      {/* Checkout */}
      <CheckoutBar
        amount={totalAmount}
        currency="Rp "
        disabled={items.length === 0}
        onPress={() => {
          navigation.navigate('Checkout', { mode: 'sales' });
        }}
      />
    </Screen>
  );
}

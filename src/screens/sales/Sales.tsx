import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import Screen from '@/components/Screen';
import Input from '@/components/Input';
import CategoryFilter from '@/components/CategoryFilter';
import ProductCard from '@/components/ProductCard';
import CheckoutBar from '@/components/CheckoutBar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/types/navigation.type';
import { useProduct } from '@/hooks/products/useProduct';
import { useSalesCartStore } from '@/stores/sales-cart.store';
import { ProductResponse } from '@/interfaces/product.interface';
import { useToastMessage } from '@/providers/toast.provider';

// import SearchBar from '@/components/sales/SearchBar';
// import CategoryFilter from '@/components/sales/CategoryFilter';
// import ProductCard from '@/components/sales/ProductCard';
// import CheckoutBar from '@/components/sales/CheckoutBar';

export default function SalesPage() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { getProductPagination } = useProduct();
  const { addItem, decreaseQty, getQty, items } = useSalesCartStore();
  const { showToast } = useToastMessage();
  const [products, setProducts] = useState<ProductResponse[]>([]);

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );

  const fetchProducts = async () => {
    const data = await getProductPagination({ page: 1, size: 50 });
    if (!data) return;
    setProducts(data.content);
  };

  useFocusEffect(
    useCallback(() => {
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
        <Input className="mt-5" />

        {/* Filter */}
        <CategoryFilter />

        {/* Section */}
        <View className="mt-4 mb-2">
          <Text className="text-white font-semibold text-lg">Most Popular</Text>
          <Text className="text-gray-400 text-xs">{products.length} items</Text>
        </View>

        {/* Product Grid */}
        <View className="flex-row flex-wrap -mx-2">
          {products.map(item => (
            <ProductCard
              key={item.id}
              item={item}
              qty={getQty(item.id)}
              remainingStock={Math.max(0, item.stock - getQty(item.id))}
              onAdd={() => onAddSalesItem(item)}
              onDecrease={() => decreaseQty(item.id)}
            />
          ))}
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

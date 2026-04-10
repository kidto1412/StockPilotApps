import FilterScroll from '@/components/FilterScroll';
import VerticalProduct from '@/components/VerticalProduct';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';

import { View, TextInput, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/Button'; // import button custom
import {
  MainStackParamList,
  NavigationMainType,
} from '@/types/navigation.type';
import { useProduct } from '@/hooks/products/useProduct';
import Screen from '@/components/Screen';
import { FlatList } from 'react-native-gesture-handler';
import { ProductItem } from '@/components/ProductFlatList';
import ButtonBottom from '@/components/ButtonBottom';
import { useProductStore } from '@/stores/product.store';
import { ProductResponse } from '@/interfaces/product.interface';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';

export default function ProductPage() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const navigation = useNavigation<any>();
  const { getProductPagination, deleteProduct } = useProduct();
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const productsDummy = [
    {
      id: '1',
      name: 'Espresso Roast Beans 1kg',
      sku: '883492',
      stock: '12 in stock',
      price: '$24.50',
      status: 'in',
    },
    {
      id: '2',
      name: 'Arabica Premium 500g',
      sku: '883561',
      stock: '45 in stock',
      price: '$18.00',
      status: 'in',
    },
    {
      id: '3',
      name: 'Oat Milk 1L',
      sku: '102938',
      stock: '2 Left',
      price: '$4.20',
      status: 'low',
    },
    {
      id: '4',
      name: 'Ceremonial Matcha 50g',
      sku: '339218',
      stock: '28 in stock',
      price: '$32.00',
      status: 'in',
    },
    {
      id: '5',
      name: 'Butter Croissant',
      sku: '550812',
      stock: 'Out of stock',
      price: '$3.50',
      status: 'out',
    },
  ];

  const loadProducts = async (pageNumber: number) => {
    const data = await getProductPagination({ page: pageNumber, size: 10 });
    if (!data) return;

    if (pageNumber === 1) {
      setProducts(data.content);
    } else {
      setProducts(prev => {
        const newProducts = data.content.filter(
          (u: any) => !prev.some(existing => existing.id === u.id),
        );
        return [...prev, ...newProducts];
      });
    }
    setHasNextPage(data.hasNextPage);
    setPage(pageNumber);
  };
  const loadMore = () => {
    if (hasNextPage) loadProducts(page + 1);
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts(1);
    }, []),
  );
  const productStore = useProductStore();
  const onEdit = (data: ProductResponse) => {
    productStore.setProduct(data);
    navigation.navigate('FormProduct');
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState('');

  const handleDelete = (user: ProductResponse) => {
    setDeleteId(user.id);
    setShowDeleteModal(true);
  };

  const onDeleteConfirm = async () => {
    if (!deleteId) return;
    await deleteProduct(deleteId);
    await loadProducts(1);
    setShowDeleteModal(false);
  };

  return (
    <Screen safeBottom>
      {/* Search Input */}
      <View className="px-5 mb-4 mt-5">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search..."
          className="bg-white rounded-lg px-4 py-3 text-gray-800"
        />
      </View>

      {/* Filter Scroll */}
      {/* <FilterScroll /> */}
      {products.length == 0 ? (
        <Text className="text-center text-gray-500 mt-5">
          Tidak ada Product
        </Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 90, // tinggi ButtonBottom + safe area
          }}
          renderItem={({ item }) => (
            <ProductItem item={item} onDelete={handleDelete} onEdit={onEdit} />
          )}
          ListFooterComponent={<View style={{ height: 120 }} />}
        />
      )}

      <ButtonBottom
        title={'Tambah Produk'}
        onPress={() => {
          navigation.navigate('FormProduct');
        }}
      />
      <ConfirmDeleteModal
        visible={showDeleteModal}
        title="Delete product"
        message="Are you sure you want to delete this product?"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={onDeleteConfirm}
      />
    </Screen>
  );
}

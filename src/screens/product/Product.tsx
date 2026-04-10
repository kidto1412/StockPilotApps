import FilterScroll from '@/components/FilterScroll';
import VerticalProduct from '@/components/VerticalProduct';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';

import {
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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
import { DrawerParamList } from '@/types/navigation.type';
import { RouteProp } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';
import { formatRupiah } from '@/utils/formatRupiah';
import { useToastMessage } from '@/providers/toast.provider';
import { getImageUrl } from '@/utils/getImage.util';
import { usePurchaseCartStore } from '@/stores/purchase-cart.store';

export default function ProductPage() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const navigation = useNavigation<any>();
  const route =
    useRoute<RouteProp<DrawerParamList, 'Product' | 'Stock' | 'Pembelian'>>();
  const source =
    route.params?.source ??
    (route.name === 'Stock'
      ? 'stock'
      : route.name === 'Pembelian'
        ? 'purchase'
        : 'product');
  const isStockMenu = source === 'stock';
  const isPurchaseMenu = source === 'purchase';
  const { getProductPagination, deleteProduct } = useProduct();
  const { showToast } = useToastMessage();
  const { addItem, items } = usePurchaseCartStore();
  const totalCartItems = items.reduce((sum, item) => sum + item.qty, 0);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [showStockActionDialog, setShowStockActionDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductResponse | null>(null);
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

  const handleStockItemPress = (product: ProductResponse) => {
    if (!isStockMenu) return;
    setSelectedProduct(product);
    setShowStockActionDialog(true);
  };

  const handlePurchaseItemPress = (product: ProductResponse) => {
    if (!isPurchaseMenu) return;
    addItem(product);
    showToast(`${product.name} ditambahkan ke keranjang`, 'success');
  };

  const openStockForm = () => {
    if (!selectedProduct) return;
    productStore.setProduct(selectedProduct);
    setShowStockActionDialog(false);
    navigation.navigate('FormProduct');
  };

  const onOpenProductLog = () => {
    setShowStockActionDialog(false);
    showToast('Fitur log barang belum tersedia', 'error');
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
          {isStockMenu
            ? 'Tidak ada stok produk'
            : isPurchaseMenu
              ? 'Tidak ada produk untuk pembelian'
              : 'Tidak ada Product'}
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
            <ProductItem
              item={item}
              onDelete={handleDelete}
              onEdit={onEdit}
              onPressItem={
                isStockMenu
                  ? handleStockItemPress
                  : isPurchaseMenu
                    ? handlePurchaseItemPress
                    : undefined
              }
              showActions={!isStockMenu && !isPurchaseMenu}
            />
          )}
          ListFooterComponent={<View style={{ height: 120 }} />}
        />
      )}

      {isPurchaseMenu ? (
        <View className="absolute bottom-4 left-4 right-4 flex-row">
          <TouchableOpacity
            className="flex-1 bg-[#24382d] rounded-2xl px-4 py-4 items-center justify-center mr-2"
            onPress={() => navigation.navigate('FormProduct')}
          >
            <Text className="font-semibold text-white">Tambah Barang</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-green-500 rounded-2xl px-4 py-4 items-center justify-center ml-2"
            onPress={() =>
              navigation.navigate('Checkout', { mode: 'purchase' })
            }
          >
            <Text className="font-semibold text-black">
              {`Keranjang (${totalCartItems})`}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ButtonBottom
          title={isStockMenu ? 'Tambah Stok' : 'Tambah Produk'}
          onPress={() => {
            navigation.navigate('FormProduct');
          }}
        />
      )}
      <ConfirmDeleteModal
        visible={showDeleteModal}
        title="Delete product"
        message="Are you sure you want to delete this product?"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={onDeleteConfirm}
      />

      <Modal
        transparent
        visible={showStockActionDialog && isStockMenu}
        animationType="fade"
        onRequestClose={() => setShowStockActionDialog(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setShowStockActionDialog(false)}
        >
          <Pressable className="bg-white rounded-t-3xl px-5 pt-4 pb-6">
            <Text className="text-center text-sm text-gray-500 mb-2">AKSI</Text>

            <View className="flex-row items-center mb-4">
              <View className="w-11 h-11 rounded-full bg-[#dff4ea] mr-3 overflow-hidden items-center justify-center">
                {selectedProduct?.imageUrl ? (
                  <Image
                    source={{ uri: getImageUrl(selectedProduct.imageUrl) }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Text className="text-[#1f6b4f] font-semibold text-sm">
                    {selectedProduct?.name?.charAt(0).toUpperCase() ?? '?'}
                  </Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">
                  {selectedProduct?.name}
                </Text>
                <Text className="text-xs text-gray-500">
                  {selectedProduct?.sku}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-gray-900 font-semibold">
                  {selectedProduct ? formatRupiah(selectedProduct.price) : '-'}
                </Text>
                <Text className="text-xs text-gray-500">
                  {selectedProduct?.stock ?? 0}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="flex-row items-center justify-between border border-[#8bb0a2] rounded-full px-4 py-3 mb-3"
              onPress={openStockForm}
            >
              <Text className="text-gray-900 font-medium">
                Tambah / Kurang Stok
              </Text>
              <ChevronRight size={18} color="#2c4b3f" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between border border-[#8bb0a2] rounded-full px-4 py-3 mb-3"
              onPress={openStockForm}
            >
              <Text className="text-gray-900 font-medium">
                Edit / Lihat Stok
              </Text>
              <ChevronRight size={18} color="#2c4b3f" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between border border-[#8bb0a2] rounded-full px-4 py-3 mb-5"
              onPress={onOpenProductLog}
            >
              <Text className="text-gray-900 font-medium">Log Barang</Text>
              <ChevronRight size={18} color="#2c4b3f" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowStockActionDialog(false)}
              className="bg-[#14c788] rounded-full py-3"
            >
              <Text className="text-white font-bold text-center">OK</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

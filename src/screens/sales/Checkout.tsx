import ButtonBottom from '@/components/ButtonBottom';
import CurrencyInput from '@/components/CurrencyInput';
import Screen from '@/components/Screen';
import SelectBox from '@/components/SelectBox';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  BackHandler,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { usePurchaseCartStore } from '@/stores/purchase-cart.store';
import { getImageUrl } from '@/utils/getImage.util';
import { formatRupiah } from '@/utils/formatRupiah';
import { ChevronLeft } from 'lucide-react-native';
import { useSupplier } from '@/hooks/supplier/useSupplier';
import { useFocusEffect } from '@react-navigation/native';
import { usePurchase } from '@/hooks/purchase/usePurchase';
import { useToastMessage } from '@/providers/toast.provider';
import { useSalesCartStore } from '@/stores/sales-cart.store';
import { useTransaction } from '@/hooks/transaction/useTransaction';

const ADD_SUPPLIER_VALUE = '__add_supplier__';
const SALES_PAYMENT_METHODS = ['CASH', 'CARD', 'TRANSFER'];

const CheckoutScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const mode: 'purchase' | 'sales' = route.params?.mode ?? 'purchase';
  const isPurchaseMode = mode === 'purchase';
  const isSalesMode = mode === 'sales';

  const purchaseCart = usePurchaseCartStore();
  const salesCart = useSalesCartStore();

  const items = isSalesMode ? salesCart.items : purchaseCart.items;
  const { getAll } = useSupplier();
  const { createPurchase } = usePurchase();
  const { createTransaction } = useTransaction();
  const { showToast } = useToastMessage();
  const [supplierId, setSupplierId] = useState<string | number | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<string | number>('CASH');
  const [discount, setDiscount] = useState('0');
  const [paidAmount, setPaidAmount] = useState('0');
  const [changeAmount, setChangeAmount] = useState(0);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [buttonBottomOffset, setButtonBottomOffset] = useState(16);
  const [supplierOptions, setSupplierOptions] = useState<
    { label: string; value: string | number }[]
  >([]);
  const subTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalPrice = isSalesMode
    ? Math.max(0, subTotal - Number(discount || 0))
    : subTotal;

  const increaseItemQty = (productId: string) => {
    if (isSalesMode) {
      const success = salesCart.increaseQty(productId);
      if (!success) {
        showToast('Qty melebihi stok produk', 'error');
      }
      return;
    }
    purchaseCart.increaseQty(productId);
  };

  const decreaseItemQty = (productId: string) => {
    if (isSalesMode) {
      salesCart.decreaseQty(productId);
      return;
    }
    purchaseCart.decreaseQty(productId);
  };

  const clearCurrentCart = () => {
    if (isSalesMode) {
      salesCart.clearCart();
      return;
    }
    purchaseCart.clearCart();
  };

  const fetchSuppliers = async () => {
    const data = await getAll({ page: 1, size: 100 });
    if (!data) return;

    const options = (data.content ?? []).map((item: any) => ({
      label: item.name,
      value: item.id ?? item.name,
    }));

    setSupplierOptions([
      { label: '+ Tambah Supplier Baru', value: ADD_SUPPLIER_VALUE },
      ...options,
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      if (isPurchaseMode) {
        fetchSuppliers();
      }
    }, [isPurchaseMode]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!isSalesMode) return;

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          navigation.navigate('Sales');
          return true;
        },
      );

      return () => subscription.remove();
    }, [isSalesMode, navigation]),
  );

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', event => {
      setButtonBottomOffset(event.endCoordinates.height + 8);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setButtonBottomOffset(16);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const onSupplierChange = (value: string | number) => {
    if (value === ADD_SUPPLIER_VALUE) {
      navigation.navigate('SupplierForm');
      return;
    }

    setSupplierId(value);
  };

  const onPaidAmountChange = (value: string) => {
    const normalized = Math.max(0, Number(value || 0));
    setPaidAmount(String(normalized));
  };

  const onCheckout = async () => {
    if (items.length === 0) {
      showToast('Keranjang masih kosong', 'error');
      return;
    }

    if (isPurchaseMode) {
      if (!supplierId || supplierId === ADD_SUPPLIER_VALUE) {
        showToast('Pilih supplier terlebih dahulu', 'error');
        return;
      }

      const payload = {
        supplierId: String(supplierId),
        items: items.map(item => ({
          productId: item.id,
          quantity: item.qty,
          cost: item.cost,
        })),
      };

      const res = await createPurchase(payload);
      if (!res) return;

      purchaseCart.clearCart();
      navigation.navigate('Pembelian', { source: 'purchase' });
      return;
    }

    const payload = {
      paymentMethod: String(paymentMethod),
      discount: Number(discount || 0),
      paidAmount: Number(paidAmount || 0),
      items: items.map(item => ({
        productId: item.id,
        quantity: item.qty,
      })),
    };

    if (payload.paidAmount <= 0) {
      showToast('Nominal bayar harus lebih dari 0', 'error');
      return;
    }

    if (payload.paidAmount < totalPrice) {
      showToast('Nominal bayar kurang dari total belanja', 'error');
      return;
    }

    const transactionRes = await createTransaction(payload);
    if (!transactionRes) return;

    const change = payload.paidAmount - totalPrice;
    salesCart.clearCart();
    if (change > 0) {
      setChangeAmount(change);
      setShowChangeModal(true);
      return;
    }

    navigation.navigate('Sales');
  };

  const renderItem = ({ item }: any) => (
    <View className="flex-row items-center bg-[#1f2a24] rounded-xl p-3 mb-3 ">
      <Image
        source={{
          uri: item.imageUrl
            ? getImageUrl(item.imageUrl)
            : 'https://via.placeholder.com/60',
        }}
        className="w-12 h-12 rounded-lg mr-3"
      />

      <View className="flex-1">
        <Text className="text-white font-semibold">{item.name}</Text>
        <Text className="text-gray-400 text-xs">
          {formatRupiah(item.price)} / unit
        </Text>
      </View>

      <View className="items-end">
        <Text className="text-white font-semibold mb-2">
          {formatRupiah(item.price * item.qty)}
        </Text>

        <View className="flex-row items-center">
          <TouchableOpacity
            className="w-6 h-6 rounded-full bg-gray-700 items-center justify-center"
            onPress={() => decreaseItemQty(item.id)}
          >
            <Text className="text-white">−</Text>
          </TouchableOpacity>

          <Text className="text-white mx-2">{item.qty}</Text>

          <TouchableOpacity
            className="w-6 h-6 rounded-full bg-green-500 items-center justify-center"
            onPress={() => increaseItemQty(item.id)}
          >
            <Text className="text-black font-bold">+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <Screen className="flex-1 px-4 pt-4" hashMenu={false}>
      <View className="flex-row items-center mb-4">
        <Pressable
          className="w-9 h-9 rounded-full bg-[#1f2a24] items-center justify-center"
          onPress={() => {
            if (isPurchaseMode) {
              navigation.navigate('Pembelian', { source: 'purchase' });
              return;
            }
            navigation.navigate('Sales');
          }}
        >
          <ChevronLeft size={20} color="#fff" />
        </Pressable>
        <Text className="text-white font-bold text-lg ml-3">
          {isPurchaseMode ? 'Checkout Pembelian' : 'Checkout Penjualan'}
        </Text>
      </View>

      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-gray-400 text-xs">CURRENT SALE</Text>
          <Text className="text-white text-lg font-bold">
            {isPurchaseMode ? 'Order Pembelian' : 'Order Penjualan'}
          </Text>
        </View>

        <TouchableOpacity
          className="bg-red-500 px-3 py-1 rounded-full"
          onPress={clearCurrentCart}
        >
          <Text className="text-white text-xs">Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View className="flex-row mb-4 space-x-2">
        <ActionButton label="Discount" />
        <ActionButton label="Customer" />
        <ActionButton label="Scan" />
      </View>

      {/* Cart List */}
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-8">
            Keranjang masih kosong
          </Text>
        }
        ListFooterComponent={
          <View className="mt-3 space-y-3">
            {isSalesMode ? (
              <>
                <Text className="text-white font-semibold">
                  Metode Pembayaran
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 4 }}
                >
                  <View className="flex-row">
                    {SALES_PAYMENT_METHODS.map(method => {
                      const isSelected = paymentMethod === method;

                      return (
                        <Pressable
                          key={method}
                          onPress={() => setPaymentMethod(method)}
                          className={`px-4 py-3 rounded-xl mr-3 border min-w-[96px] items-center ${
                            isSelected
                              ? 'bg-green-500 border-green-400'
                              : 'bg-[#1f2a24] border-[#2d4337]'
                          }`}
                        >
                          <Text
                            className={`font-semibold ${
                              isSelected ? 'text-black' : 'text-white'
                            }`}
                          >
                            {method}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
                <CurrencyInput
                  label="Discount"
                  value={discount}
                  onChangeValue={setDiscount}
                />
                <CurrencyInput
                  label="Dibayar"
                  value={paidAmount}
                  onChangeValue={onPaidAmountChange}
                />
              </>
            ) : (
              <SelectBox
                options={supplierOptions}
                selectedValue={supplierId}
                placeholder="Pilih Supplier"
                onOpen={fetchSuppliers}
                onValueChange={onSupplierChange}
              />
            )}
            <View className="flex-row justify-end mt-5">
              <Text className="text-primary text-xl font-bold">
                {formatRupiah(totalPrice)}
              </Text>
            </View>
          </View>
        }
      />

      <ButtonBottom
        title={'Bayar'}
        onPress={onCheckout}
        bottomOffset={buttonBottomOffset}
      />

      <Modal
        transparent
        visible={showChangeModal}
        animationType="fade"
        onRequestClose={() => {
          setShowChangeModal(false);
          navigation.navigate('Sales');
        }}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-center items-center px-6"
          onPress={() => {
            setShowChangeModal(false);
            navigation.navigate('Sales');
          }}
        >
          <Pressable className="w-full bg-white rounded-2xl p-5">
            <Text className="text-center text-lg font-bold text-gray-900 mb-2">
              Kembalian
            </Text>
            <Text className="text-center text-2xl font-bold text-green-600 mb-5">
              {formatRupiah(changeAmount)}
            </Text>

            <TouchableOpacity
              className="bg-green-500 rounded-xl py-3"
              onPress={() => {
                setShowChangeModal(false);
                navigation.navigate('Sales');
              }}
            >
              <Text className="text-center font-semibold text-black">OK</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
};

const ActionButton = ({ label }: { label: string }) => (
  <TouchableOpacity className="flex-1 bg-[#1f2a24] rounded-xl py-3 items-center mx-2">
    <Text className="text-green-400 font-semibold">{label}</Text>
  </TouchableOpacity>
);

export default CheckoutScreen;

import ButtonBottom from '@/components/ButtonBottom';
import CurrencyInput from '@/components/CurrencyInput';
import Screen from '@/components/Screen';
import SelectBox from '@/components/SelectBox';
import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';

const cartItems = [
  {
    id: '1',
    name: 'Espresso - Double',
    price: 3.5,
    qty: 1,
    image: 'https://via.placeholder.com/60',
  },
  {
    id: '2',
    name: 'Butter Croissant',
    price: 4.0,
    qty: 2,
    image: 'https://via.placeholder.com/60',
  },
  {
    id: '3',
    name: 'Oat Latte',
    price: 5.5,
    qty: 1,
    image: 'https://via.placeholder.com/60',
  },
];

const CheckoutScreen = () => {
  const renderItem = ({ item }: any) => (
    <View className="flex-row items-center bg-[#1f2a24] rounded-xl p-3 mb-3 ">
      <Image
        source={{ uri: item.image }}
        className="w-12 h-12 rounded-lg mr-3"
      />

      <View className="flex-1">
        <Text className="text-white font-semibold">{item.name}</Text>
        <Text className="text-gray-400 text-xs">
          ${item.price.toFixed(2)} / unit
        </Text>
      </View>

      <View className="items-end">
        <Text className="text-white font-semibold mb-2">
          ${(item.price * item.qty).toFixed(2)}
        </Text>

        <View className="flex-row items-center">
          <TouchableOpacity className="w-6 h-6 rounded-full bg-gray-700 items-center justify-center">
            <Text className="text-white">−</Text>
          </TouchableOpacity>

          <Text className="text-white mx-2">{item.qty}</Text>

          <TouchableOpacity className="w-6 h-6 rounded-full bg-green-500 items-center justify-center">
            <Text className="text-black font-bold">+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <Screen className="flex-1 px-4 pt-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-gray-400 text-xs">CURRENT SALE</Text>
          <Text className="text-white text-lg font-bold">Order #4092</Text>
        </View>

        <TouchableOpacity className="bg-red-500 px-3 py-1 rounded-full">
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
        data={cartItems}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        ListFooterComponent={
          <View className="mt-3 space-y-3">
            <CurrencyInput />
            <SelectBox options={[]} />
            <View className="flex-row justify-end mt-5">
              <Text className="text-primary text-xl font-bold">Rp.2000</Text>
            </View>
          </View>
        }
      />

      <ButtonBottom title={'Bayar'} onPress={() => console.log('')} />
    </Screen>
  );
};

const ActionButton = ({ label }: { label: string }) => (
  <TouchableOpacity className="flex-1 bg-[#1f2a24] rounded-xl py-3 items-center mx-2">
    <Text className="text-green-400 font-semibold">{label}</Text>
  </TouchableOpacity>
);

export default CheckoutScreen;

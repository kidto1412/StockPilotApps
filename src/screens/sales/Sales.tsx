import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import Screen from '@/components/Screen';
import Input from '@/components/Input';
import CategoryFilter from '@/components/CategoryFilter';
import ProductCard from '@/components/ProductCard';
import CheckoutBar from '@/components/CheckoutBar';

// import SearchBar from '@/components/sales/SearchBar';
// import CategoryFilter from '@/components/sales/CategoryFilter';
// import ProductCard from '@/components/sales/ProductCard';
// import CheckoutBar from '@/components/sales/CheckoutBar';

const PRODUCTS = [
  {
    id: 1,
    name: 'Cappuccino Large',
    price: 4.5,
    image: 'https://i.imgur.com/6XKZ8ZL.png',
  },
  {
    id: 2,
    name: 'Fresh Avocado',
    price: 1.99,
    image: 'https://i.imgur.com/F1vGZ5G.png',
  },
  {
    id: 3,
    name: 'Artisan Sourdough',
    price: 6.5,
    image: 'https://i.imgur.com/5RHR6Ku.png',
  },
  {
    id: 4,
    name: 'Bolt Energy Drink',
    price: 3.0,
    image: 'https://i.imgur.com/HT8zK3S.png',
  },
];

export default function SalesPage() {
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
          <Text className="text-gray-400 text-xs">12 items</Text>
        </View>

        {/* Product Grid */}
        <View className="flex-row flex-wrap -mx-2">
          {PRODUCTS.map(item => (
            <ProductCard key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>

      {/* Checkout */}
      <CheckoutBar />
    </Screen>
  );
}

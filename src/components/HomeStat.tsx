import React from 'react';
import { View, Text } from 'react-native';
import { CreditCard, Receipt, Star, Wallet } from 'lucide-react-native';

interface StatItemProps {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  iconBg: string;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
}: StatItemProps) {
  return (
    <View className="w-1/2 p-2">
      <View className="bg-[#1B2A21] rounded-2xl p-4">
        <View
          className="w-9 h-9 rounded-xl items-center justify-center mb-3"
          style={{ backgroundColor: iconBg }}
        >
          <Icon size={18} color="white" />
        </View>

        <Text className="text-white text-lg font-bold">{value}</Text>
        <Text className="text-xs text-gray-400">{subtitle}</Text>
      </View>
    </View>
  );
}

export default function HomeStats() {
  return (
    <View className="flex-row flex-wrap -mx-2 mt-4">
      <StatCard
        title="Transaksi"
        value="45"
        subtitle="Transaksi"
        icon={Receipt}
        iconBg="#2563EB"
      />
      <StatCard
        title="Pemasukan"
        value="$54.00"
        subtitle="Pemasukan"
        icon={Wallet}
        iconBg="#7C3AED"
      />
      <StatCard
        title="Produk Terlaris"
        value="Latte L"
        subtitle="Produk Terlaris"
        icon={Star}
        iconBg="#F59E0B"
      />
      <StatCard
        title="Top Kategori"
        value="Elektronuk"
        subtitle="Top Kategori"
        icon={Star}
        iconBg="#EC4899"
      />
    </View>
  );
}

import React from 'react';
import { View, Text } from 'react-native';
import { Boxes, ShoppingBag, Tags, Wallet } from 'lucide-react-native';
import { useDashboard } from '@/hooks/dashboard/useDashboard';
import { useEffect, useRef, useState } from 'react';
import { DashboardSummaryResponse } from '@/interfaces/dashboard.interface';
import { formatRupiah } from '@/utils/formatRupiah';

interface StatItemProps {
  value: string;
  subtitle: string;
  icon: any;
  iconBg: string;
}

function StatCard({ value, subtitle, icon: Icon, iconBg }: StatItemProps) {
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
  const { getSummary, isLoading } = useDashboard();
  const getSummaryRef = useRef(getSummary);
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);

  useEffect(() => {
    getSummaryRef.current = getSummary;
  }, [getSummary]);

  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      const res = await getSummaryRef.current();
      if (!res || !isMounted) return;
      setSummary(res);
    };

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View className="flex-row flex-wrap -mx-2 mt-4">
      <StatCard
        value={isLoading ? 'Loading...' : `${summary?.totalProducts ?? 0}`}
        subtitle="Total Produk"
        icon={Boxes}
        iconBg="#2563EB"
      />
      <StatCard
        value={isLoading ? 'Loading...' : `${summary?.totalCategories ?? 0}`}
        subtitle="Total Kategori"
        icon={Tags}
        iconBg="#7C3AED"
      />
      <StatCard
        value={isLoading ? 'Loading...' : `${summary?.totalSold ?? 0}`}
        subtitle="Total Terjual"
        icon={ShoppingBag}
        iconBg="#F59E0B"
      />
      <StatCard
        value={
          isLoading
            ? 'Loading...'
            : `Rp ${formatRupiah(summary?.totalSalesAmount ?? 0) || '0'}`
        }
        subtitle="Total Profit"
        icon={Wallet}
        iconBg="#EC4899"
      />
    </View>
  );
}

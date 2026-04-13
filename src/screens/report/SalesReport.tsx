import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Screen from '@/components/Screen';
import Input from '@/components/Input';
import SelectBox from '@/components/SelectBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatRupiah } from '@/utils/formatRupiah';
import { LineChart } from 'react-native-chart-kit';
import {
  SalesChartGroupBy,
  SalesStatusFilter,
  SalesReportSummary,
  SoldProductItem,
} from '@/interfaces/sales-report.interface';
import { useSalesReport } from '@/hooks/report/useSalesReport';
import { useFocusEffect } from '@react-navigation/native';

const today = new Date();
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

const toIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const paymentMethodOptions = [
  { label: 'Semua Metode', value: '' },
  { label: 'CASH', value: 'CASH' },
  { label: 'CARD', value: 'CARD' },
  { label: 'TRANSFER', value: 'TRANSFER' },
];

const groupByOptions: { label: string; value: SalesChartGroupBy }[] = [
  { label: 'Harian', value: 'DAILY' },
  { label: 'Bulanan', value: 'MONTHLY' },
  { label: 'Tahunan', value: 'YEARLY' },
];

const statusOptions: { label: string; value: SalesStatusFilter }[] = [
  { label: 'Semua Status', value: 'ALL' },
  { label: 'DRAFT', value: 'DRAFT' },
  { label: 'COMPLETED', value: 'COMPLETED' },
  { label: 'CANCELED', value: 'CANCELED' },
];

const displayRupiah = (value: number | string | null | undefined) => {
  const numeric = Number(value ?? 0);
  if (Number.isNaN(numeric)) return '0';
  if (numeric < 0) return `-${formatRupiah(Math.abs(numeric)) || '0'}`;
  return formatRupiah(numeric) || '0';
};

export default function SalesReportPage() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { getSalesReport, getSalesChart } = useSalesReport();
  const [items, setItems] = useState<SoldProductItem[]>([]);
  const [summary, setSummary] = useState<SalesReportSummary>({
    totalSalesAmount: 0,
    totalCost: 0,
    totalProfit: 0,
    totalSoldProducts: 0,
    totalSoldQuantity: 0,
  });
  const [startDate, setStartDate] = useState(toIsoDate(firstDay));
  const [endDate, setEndDate] = useState(toIsoDate(today));
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [groupBy, setGroupBy] = useState<SalesChartGroupBy>('DAILY');
  const [status, setStatus] = useState<SalesStatusFilter>('ALL');
  const [chartItems, setChartItems] = useState<
    {
      period: string;
      totalRevenue: number;
      totalCost: number;
      totalProfit: number;
      totalLoss: number;
    }[]
  >([]);
  const [chartSummary, setChartSummary] = useState({
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    totalLoss: 0,
  });

  const chartLabels =
    chartItems.length > 0
      ? chartItems.map(item => {
          if (groupBy === 'DAILY') {
            return item.period.slice(5);
          }
          return item.period;
        })
      : ['-'];

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        data:
          chartItems.length > 0
            ? chartItems.map(item => Number(item.totalProfit ?? 0))
            : [0],
        color: () => '#10B981',
        strokeWidth: 2,
      },
      {
        data:
          chartItems.length > 0
            ? chartItems.map(item => Number(item.totalLoss ?? 0))
            : [0],
        color: () => '#FB923C',
        strokeWidth: 2,
      },
    ],
    legend: ['Profit', 'Loss'],
  };

  const chartWidth = Math.max(screenWidth - 32, chartLabels.length * 72);

  const chartConfig = {
    backgroundColor: '#1f2a24',
    backgroundGradientFrom: '#1f2a24',
    backgroundGradientTo: '#1f2a24',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(209, 213, 219, ${opacity})`,
    propsForDots: {
      r: '3',
      strokeWidth: '1',
      stroke: '#0f2215',
    },
  };

  const fetchSales = async () => {
    const [data, chart] = await Promise.all([
      getSalesReport({
        page: '1',
        size: '10',
        startDate,
        endDate,
        paymentMethod: paymentMethod || undefined,
      }),
      getSalesChart({
        startDate,
        endDate,
        paymentMethod: paymentMethod || undefined,
        groupBy,
        status: status === 'ALL' ? undefined : status,
      }),
    ]);

    if (data) {
      const nextSummary: SalesReportSummary = {
        totalSalesAmount:
          data.summary?.totalSalesAmount ?? data.totalSalesAmount ?? 0,
        totalCost: data.summary?.totalCost ?? data.totalCost ?? 0,
        totalProfit: data.summary?.totalProfit ?? data.totalProfit ?? 0,
        totalSoldProducts:
          data.summary?.totalSoldProducts ??
          data.content?.length ??
          data.soldProducts?.length ??
          0,
        totalSoldQuantity:
          data.summary?.totalSoldQuantity ??
          data.content?.reduce(
            (acc, item) => acc + (item.totalQuantity || 0),
            0,
          ) ??
          0,
      };

      setSummary(nextSummary);
      setItems(data.content ?? data.soldProducts ?? []);
    }

    if (chart) {
      setChartItems(chart.content ?? []);
      setChartSummary({
        totalRevenue: chart.summary?.totalRevenue ?? 0,
        totalCost: chart.summary?.totalCost ?? 0,
        totalProfit: chart.summary?.totalProfit ?? 0,
        totalLoss: chart.summary?.totalLoss ?? 0,
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSales();
    }, []),
  );

  return (
    <Screen className="px-4">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <Text className="text-white font-bold text-xl mb-4">
          List Penjualan
        </Text>

        <Input
          label="Start Date (YYYY-MM-DD)"
          value={startDate}
          onChangeText={setStartDate}
          placeholder="2026-04-01"
        />
        <Input
          label="End Date (YYYY-MM-DD)"
          value={endDate}
          onChangeText={setEndDate}
          placeholder="2026-04-11"
        />

        <SelectBox
          className="mb-4"
          options={paymentMethodOptions}
          selectedValue={paymentMethod}
          onValueChange={value => setPaymentMethod(String(value))}
          placeholder="Pilih Metode Pembayaran"
        />

        <SelectBox
          className="mb-4"
          options={groupByOptions}
          selectedValue={groupBy}
          onValueChange={value => setGroupBy(value as SalesChartGroupBy)}
          placeholder="Pilih Periode Chart"
        />

        <SelectBox
          className="mb-4"
          options={statusOptions}
          selectedValue={status}
          onValueChange={value => setStatus(value as SalesStatusFilter)}
          placeholder="Pilih Status"
        />

        <TouchableOpacity
          className="bg-green-600 rounded-lg py-3 mb-4"
          onPress={fetchSales}
        >
          <Text className="text-center text-white font-semibold">
            Apply Filter
          </Text>
        </TouchableOpacity>

        <View className="bg-[#1f2a24] rounded-2xl p-4 mb-4">
          <Text className="text-white font-semibold mb-2">
            Chart Profit/Loss ({groupBy})
          </Text>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-300 text-xs">Revenue</Text>
            <Text className="text-green-400 text-xs font-semibold">
              Rp {displayRupiah(chartSummary.totalRevenue)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-300 text-xs">Cost</Text>
            <Text className="text-red-400 text-xs font-semibold">
              Rp {displayRupiah(chartSummary.totalCost)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-300 text-xs">Profit</Text>
            <Text className="text-emerald-400 text-xs font-semibold">
              Rp {displayRupiah(chartSummary.totalProfit)}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-300 text-xs">Loss</Text>
            <Text className="text-orange-400 text-xs font-semibold">
              Rp {displayRupiah(chartSummary.totalLoss)}
            </Text>
          </View>

          {chartItems.length > 0 ? (
            <View className="mt-3 border-t border-[#2d4337] pt-3">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart
                  data={chartData}
                  width={chartWidth}
                  height={220}
                  yAxisLabel="Rp "
                  chartConfig={chartConfig}
                  bezier
                  fromZero
                  withShadow={false}
                  style={{ borderRadius: 12 }}
                />
              </ScrollView>
            </View>
          ) : (
            <Text className="text-gray-400 text-xs mt-3">
              Belum ada data chart untuk filter ini
            </Text>
          )}
        </View>

        <View className="bg-[#1f2a24] rounded-2xl p-4 mb-4">
          <Text className="text-white font-semibold mb-2">Ringkasan</Text>
          <Text className="text-gray-300 text-sm">Total Sales Amount</Text>
          <Text className="text-green-400 font-bold mb-2">
            Rp {displayRupiah(summary.totalSalesAmount)}
          </Text>
          <Text className="text-gray-300 text-sm">Total Cost</Text>
          <Text className="text-red-400 font-bold mb-2">
            Rp {displayRupiah(summary.totalCost)}
          </Text>
          <Text className="text-gray-300 text-sm">Total Profit</Text>
          <Text className="text-emerald-400 font-bold">
            Rp {displayRupiah(summary.totalProfit)}
          </Text>
          <Text className="text-gray-300 text-sm mt-2">Produk Terjual</Text>
          <Text className="text-white font-semibold mb-1">
            {summary.totalSoldProducts}
          </Text>
          <Text className="text-gray-300 text-sm">Qty Terjual</Text>
          <Text className="text-white font-semibold">
            {summary.totalSoldQuantity}
          </Text>
        </View>

        {items.length === 0 ? (
          <Text className="text-center text-gray-400 mt-8">
            Belum ada data penjualan
          </Text>
        ) : (
          items.map(item => (
            <View
              key={item.productId}
              className="bg-[#1f2a24] rounded-xl p-4 mb-3"
            >
              <Text className="text-white font-semibold">
                {item.productName || (item as any).name || '-'}
              </Text>
              <Text className="text-gray-400 text-xs mt-1">
                Barcode: {item.barcode || '-'}
              </Text>
              <View className="mt-2">
                <Text className="text-gray-300 text-xs">
                  Qty Terjual: {item.totalQuantity ?? 0}
                </Text>
                <Text className="text-gray-300 text-xs">
                  Revenue: Rp {displayRupiah(item.totalRevenue)}
                </Text>
                <Text className="text-gray-300 text-xs">
                  Cost: Rp {displayRupiah(item.totalCost)}
                </Text>
                <Text className="text-green-400 text-xs font-semibold">
                  Profit: Rp {displayRupiah(item.totalProfit)}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Screen from '../../components/Screen';
import Input from '@/components/Input';
import SelectBox from '@/components/SelectBox';
import { useReportTransaction } from '@/hooks/report/useReportTransaction';
import { ReportTransactionItem } from '@/interfaces/report-transaction.interface';
import { formatRupiah } from '@/utils/formatRupiah';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const today = new Date();
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

const toIsoDate = (date: Date) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const paymentMethodOptions = [
  { label: 'Semua Metode', value: '' },
  { label: 'CASH', value: 'CASH' },
  { label: 'CARD', value: 'CARD' },
  { label: 'TRANSFER', value: 'TRANSFER' },
];

const statusOptions = [
  { label: 'Semua Status', value: '' },
  { label: 'COMPLETED', value: 'COMPLETED' },
  { label: 'PENDING', value: 'PENDING' },
  { label: 'CANCELLED', value: 'CANCELLED' },
];

const ReportPage = () => {
  const insets = useSafeAreaInsets();
  const { getReportTransaction, exportReportTransaction } =
    useReportTransaction();
  const [items, setItems] = useState<ReportTransactionItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const [startDate, setStartDate] = useState(toIsoDate(firstDay));
  const [endDate, setEndDate] = useState(toIsoDate(today));
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const fetchReport = async (targetPage: number, reset = false) => {
    const data = await getReportTransaction({
      page: targetPage,
      size: 10,
      startDate,
      endDate,
      paymentMethod: paymentMethod || undefined,
      status: status || undefined,
    });

    if (!data) return;

    if (reset || targetPage === 1) {
      setItems(data.content ?? []);
    } else {
      setItems(prev => [
        ...prev,
        ...(data.content ?? []).filter(
          (item: ReportTransactionItem) =>
            !prev.some(existing => existing.id === item.id),
        ),
      ]);
    }

    setPage(targetPage);
    setHasNextPage(Boolean(data.hasNextPage));
  };

  useEffect(() => {
    fetchReport(1, true);
  }, []);

  const handleApplyFilter = () => {
    fetchReport(1, true);
  };

  const handleLoadMore = () => {
    if (!hasNextPage) return;
    fetchReport(page + 1);
  };

  const exportExcel = async () => {
    await exportReportTransaction({
      groupBy: 'DAILY',
      format: 'EXCEL',
      startDate,
      endDate,
    });
  };

  const exportPdf = async () => {
    await exportReportTransaction({
      groupBy: 'MONTHLY',
      format: 'PDF',
      startDate,
      endDate,
    });
  };

  return (
    <Screen className="px-4">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <Text className="text-white font-bold text-xl mb-4">
          Report Transaction
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
          placeholder="2026-04-10"
        />

        <SelectBox
          className="mb-3"
          options={paymentMethodOptions}
          selectedValue={paymentMethod}
          onValueChange={value => setPaymentMethod(String(value))}
          placeholder="Pilih Metode Pembayaran"
        />
        <SelectBox
          className="mb-4"
          options={statusOptions}
          selectedValue={status}
          onValueChange={value => setStatus(String(value))}
          placeholder="Pilih Status"
        />

        <View className="flex-row mb-3">
          <TouchableOpacity
            className="bg-green-600 rounded-lg py-3 flex-1 mr-2"
            onPress={handleApplyFilter}
          >
            <Text className="text-center text-white font-semibold">
              Apply Filter
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-emerald-500 rounded-lg py-3 flex-1 ml-2"
            onPress={exportExcel}
          >
            <Text className="text-center text-black font-semibold">
              Export Excel
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          className="bg-red-500 rounded-lg py-3 mb-4"
          onPress={exportPdf}
        >
          <Text className="text-center text-white font-semibold">
            Export PDF
          </Text>
        </TouchableOpacity>

        {items.length === 0 ? (
          <Text className="text-center text-gray-400 mt-8">
            Belum ada data report transaction
          </Text>
        ) : (
          <>
            {items.map(item => (
              <View key={item.id} className="bg-[#1f2a24] rounded-xl p-4 mb-3">
                <Text className="text-white font-semibold">
                  {item.invoiceNumber || item.id}
                </Text>
                <Text className="text-gray-400 text-xs mt-1">
                  {item.paymentMethod} • {item.status}
                </Text>
                <Text className="text-green-400 font-bold mt-2">
                  {formatRupiah(item.totalAmount ?? 0)}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">
                  {item.createdAt || '-'}
                </Text>
              </View>
            ))}

            {hasNextPage ? (
              <TouchableOpacity
                className="bg-[#24382d] rounded-lg py-3 mt-1"
                onPress={handleLoadMore}
              >
                <Text className="text-center text-white font-semibold">
                  Muat Lebih Banyak
                </Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}
      </ScrollView>
    </Screen>
  );
};

export default ReportPage;

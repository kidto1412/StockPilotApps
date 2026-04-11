import { Pressable, ScrollView, Text, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import HistoryCard from '@/components/HistoryCard';
import { HistoryCardProps } from '@/types/history-card.type';
import DatePicker from '@/components/DatePicker';
import Screen from '@/components/Screen';
import SelectBox from '@/components/SelectBox';
import { useStockMovement } from '@/hooks/stock/useStockMovement';
import { useCategory } from '@/hooks/category/useCategory';
import { StockMovementType } from '@/interfaces/stock-movement.interface';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const toIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function History() {
  const insets = useSafeAreaInsets();
  const { getHistory } = useStockMovement();
  const { getAll } = useCategory();
  const getHistoryRef = useRef(getHistory);
  const getAllRef = useRef(getAll);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >(undefined);
  const [selectedType, setSelectedType] = useState<
    StockMovementType | undefined
  >(undefined);

  const [items, setItems] = useState<HistoryCardProps[]>([]);
  const [categories, setCategories] = useState<
    { label: string; value: string | number }[]
  >([{ label: 'Semua Kategori', value: 'ALL' }]);
  const [summary, setSummary] = useState({ totalIn: 0, totalOut: 0, net: 0 });

  useEffect(() => {
    getHistoryRef.current = getHistory;
  }, [getHistory]);

  useEffect(() => {
    getAllRef.current = getAll;
  }, [getAll]);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      const res = await getAllRef.current();
      if (!res || !isMounted) return;

      const options = res.map(category => ({
        label: category.name,
        value: category.id,
      }));
      setCategories([{ label: 'Semua Kategori', value: 'ALL' }, ...options]);
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      const res = await getHistoryRef.current({
        page: 1,
        size: 20,
        categoryId: selectedCategoryId,
        startDate: toIsoDate(startDate),
        endDate: toIsoDate(endDate),
        type: selectedType,
      });

      if (!res || !isMounted) return;

      setSummary(res.summary || { totalIn: 0, totalOut: 0, net: 0 });
      const mapped: HistoryCardProps[] = res.content.map(item => ({
        id: item.id,
        type: item.type,
        quantity: item.quantity,
        source: item.source,
        productName: item.product?.name || '-',
        categoryName: item.product?.category?.name,
        supplierName: item.supplier?.name,
        invoiceNumber: item.reference?.invoiceNumber,
        note: item.note || undefined,
        createdAt: item.createdAt,
      }));
      setItems(mapped);
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [selectedCategoryId, startDate, endDate, selectedType]);

  return (
    <Screen className="flex-1 p-5">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <View className="p-3">
          <Text className="font-bold mb-5 text-white">Riwayat</Text>

          <View className="bg-white rounded-lg p-3 mb-4">
            <Text className="text-black font-semibold">Ringkasan</Text>
            <Text className="text-gray-700 mt-1">
              Total Masuk: {summary.totalIn}
            </Text>
            <Text className="text-gray-700">
              Total Keluar: {summary.totalOut}
            </Text>
            <Text className="text-gray-700">Net: {summary.net}</Text>
          </View>

          <Text className="text-white mb-2">Kategori Produk</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
            className="mb-3"
          >
            {categories.map(category => {
              const value = String(category.value);
              const isActive = (selectedCategoryId || 'ALL') === value;

              return (
                <Pressable
                  key={value}
                  onPress={() => {
                    setSelectedCategoryId(value === 'ALL' ? undefined : value);
                  }}
                  className={`mr-2 px-4 py-2 rounded-xl border ${
                    isActive
                      ? 'bg-green-500 border-green-400'
                      : 'bg-[#1d1d1d] border-gray-700'
                  }`}
                >
                  <Text
                    className={`font-medium ${isActive ? 'text-black' : 'text-white'}`}
                  >
                    {category.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <SelectBox
            options={[
              { label: 'Semua Tipe', value: 'ALL' },
              { label: 'Masuk (IN)', value: 'IN' },
              { label: 'Keluar (OUT)', value: 'OUT' },
            ]}
            selectedValue={selectedType || 'ALL'}
            placeholder="Pilih tipe"
            onValueChange={value => {
              setSelectedType(
                value === 'ALL' ? undefined : (value as StockMovementType),
              );
            }}
            className="mb-2"
          />

          <DatePicker
            label="Tanggal Awal"
            value={startDate}
            onChange={setStartDate}
          />
          <DatePicker
            label="Tanggal Akhir"
            value={endDate}
            onChange={setEndDate}
          />

          <View className="mt-2">
            {items.length > 0 ? (
              items.map(item => <HistoryCard key={item.id} {...item} />)
            ) : (
              <Text className="text-gray-300 text-center mt-8">
                Tidak ada data stock movement
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

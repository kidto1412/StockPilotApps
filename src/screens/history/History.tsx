import {
  FlatList,
  ScrollViewComponent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useState } from 'react';
import HistoryCard from '@/components/HistoryCard';
import { HistoryCardProps } from '@/types/history-card.type';
import { ScrollView } from 'react-native-gesture-handler';
import Input from '@/components/Input';
import DatePicker from '@/components/DatePicker';
import Screen from '@/components/Screen';

const data: HistoryCardProps[] = [
  {
    id: '1',
    amount: '1.000 USD',
    date: 'Sep 25, 2023 4:40 PM',
    status: 'Incomplete',
    bank: 'Bank BCA',
    cardNumber: '**** 0098',
  },
  {
    id: '2',
    amount: '1.000 USD',
    date: 'Aug 25, 2023 2:32 PM',
    status: 'Failed',
    bank: 'Bank BCA',
    cardNumber: '**** 0098',
  },
  {
    id: '3',
    amount: '1.000 USD',
    date: 'Jul 24, 2023 10:28 AM',
    status: 'Success',
    bank: 'Bank BCA',
    cardNumber: '**** 0098',
  },
];

export default function History() {
  const [date, setDate] = useState(new Date());
  return (
    <Screen className="flex-1 p-5">
      <View className="p-3">
        <Text className="font-bold mb-5 text-white">Riwayat</Text>
        <Input label="Cari" placeholder="Cari...."></Input>
        {/* <DatePicker label="Pilih tanggal" value={date} onChange={setDate} /> */}
        <FlatList
          data={data}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <HistoryCard {...item} />}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({});

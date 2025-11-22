// components/HistoryCard.tsx
import { HistoryCardProps } from '@/types/history-card.type';
import React from 'react';
import { View, Text } from 'react-native';

export default function HistoryCard({
  amount,
  date,
  status,
  bank,
  cardNumber,
}: HistoryCardProps) {
  const statusColor = {
    Success: 'bg-green-100 text-green-700',
    Failed: 'bg-red-100 text-red-700',
    Incomplete: 'bg-gray-100 text-gray-700',
  }[status];

  return (
    <View className="bg-white rounded-lg shadow p-4 mb-3">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-semibold">{amount}</Text>
        <View className={`px-2 py-1 rounded ${statusColor}`}>
          <Text className="text-sm font-medium">{status}</Text>
        </View>
      </View>
      <Text className="text-gray-500 text-sm mb-1">{date}</Text>
      <Text className="text-gray-700 text-sm">
        {bank} {cardNumber}
      </Text>
    </View>
  );
}

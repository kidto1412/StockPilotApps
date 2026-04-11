// components/HistoryCard.tsx
import { HistoryCardProps } from '@/types/history-card.type';
import React from 'react';
import { View, Text } from 'react-native';

export default function HistoryCard({
  type,
  quantity,
  source,
  productName,
  categoryName,
  supplierName,
  invoiceNumber,
  note,
  createdAt,
}: HistoryCardProps) {
  const typeColor = type === 'IN' ? 'bg-green-100' : 'bg-red-100';
  const typeTextColor = type === 'IN' ? 'text-green-700' : 'text-red-700';
  const formattedDate = new Date(createdAt).toLocaleString('id-ID');

  return (
    <View className="bg-white rounded-lg shadow p-4 mb-3">
      <View className="flex-row justify-between items-center mb-2">
        <View>
          <Text className="text-lg font-semibold text-black">
            {productName}
          </Text>
          <Text className="text-xs text-gray-500">{categoryName || '-'}</Text>
        </View>
        <View className={`px-2 py-1 rounded ${typeColor}`}>
          <Text className={`text-sm font-semibold ${typeTextColor}`}>
            {type} {quantity}
          </Text>
        </View>
      </View>
      <Text className="text-gray-500 text-sm mb-1">{formattedDate}</Text>
      <Text className="text-gray-700 text-sm">Sumber: {source}</Text>
      <Text className="text-gray-700 text-sm">
        Supplier: {supplierName || '-'}
      </Text>
      <Text className="text-gray-700 text-sm">
        Invoice: {invoiceNumber || '-'}
      </Text>
      {!!note && (
        <Text className="text-gray-500 text-sm mt-1">Catatan: {note}</Text>
      )}
    </View>
  );
}

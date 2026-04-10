import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  supplier: any;
  onEdit: (supplier: any) => void;
  onDelete: (supplier: any) => void;
}

export default function ListSupplierCard({
  supplier,
  onEdit,
  onDelete,
}: Props) {
  return (
    <View className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-200">
      {/* Name */}
      <Text className="text-lg font-bold text-gray-800">{supplier.name}</Text>

      {/* Phone */}
      {supplier.phone && (
        <Text className="text-gray-500 mt-1">📞 {supplier.phone}</Text>
      )}

      {/* Email */}
      {supplier.email && (
        <Text className="text-gray-500">✉️ {supplier.email}</Text>
      )}

      {/* Address */}
      {supplier.address && (
        <Text className="text-gray-500">📍 {supplier.address}</Text>
      )}

      {/* Buttons */}
      <View className="flex-row justify-end mt-3">
        <TouchableOpacity
          onPress={() => onEdit(supplier)}
          className="bg-blue-500 px-4 py-2 rounded-xl mr-2"
        >
          <Text className="text-white font-semibold">Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onDelete(supplier)}
          className="bg-red-500 px-4 py-2 rounded-xl"
        >
          <Text className="text-white font-semibold">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

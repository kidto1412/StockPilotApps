import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { UserResponse } from '@/interfaces/user.interface';
import { Edit, Trash2, User } from 'lucide-react-native';

interface ListUserCardProps {
  user: UserResponse;
  onEdit: (user: UserResponse) => void;
  onDelete: (user: UserResponse) => void;
}

export default function ListUserCard({
  user,
  onEdit,
  onDelete,
}: ListUserCardProps) {
  return (
    <View className="bg-white rounded-2xl mb-4 p-4 shadow-sm border border-gray-200">
      {/* Row: Avatar + Info */}
      <View className="flex-row">
        <View className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mt-1">
          <User size={26} color="#555" />
        </View>

        <View className="ml-3 flex-1">
          <Text className="text-base font-semibold text-gray-900">
            {user.fullName}
          </Text>

          <Text className="text-gray-600 text-sm mt-1">Role: {user.role}</Text>
        </View>
      </View>

      {/* Buttons inside card */}
      <View className="flex-row space-x-4 mt-4 justify-end">
        <TouchableOpacity
          onPress={() => onEdit(user)}
          className="flex-row items-center px-3 py-2 bg-blue-100 rounded-xl"
        >
          <Edit size={18} color="#2563eb" />
          <Text className="ml-1 text-blue-600 font-semibold">Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onDelete(user)}
          className="flex-row items-center px-3 py-2 bg-red-100 rounded-xl ml-2"
        >
          <Trash2 size={18} color="#dc2626" />
          <Text className="ml-2 text-red-600 font-semibold">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

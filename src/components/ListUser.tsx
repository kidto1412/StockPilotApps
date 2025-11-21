import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { UserResponse } from '@/interfaces/user.interface';

interface ListUserCardProps {
  users: UserResponse[];
  onEdit: (user: UserResponse) => void;
  onDelete: (user: UserResponse) => void;
}

export default function ListUserCard({
  users,
  onEdit,
  onDelete,
}: ListUserCardProps) {
  return (
    <View className="px-4 pb-52">
      {users.map(user => (
        <View key={user.id} className="mb-5 bg-white rounded-2xl p-3 shadow-sm">
          <View className="flex-1 justify-center">
            <Text className="text-base font-semibold text-gray-900">
              {user.fullName}
            </Text>

            <Text className="text-gray-600 text-sm">{user.email}</Text>
            <Text className="text-gray-600 text-sm">{user.phone}</Text>
            <Text className="text-gray-600 text-xs mt-1">
              Role: {user.role}
            </Text>

            <View className="flex-row space-x-6 mt-3">
              <TouchableOpacity onPress={() => onEdit(user)}>
                <Text className="text-blue-600 font-semibold">Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => onDelete(user)}>
                <Text className="text-red-600 font-semibold">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

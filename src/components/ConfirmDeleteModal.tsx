import React from 'react';
import { Modal, View, Text, Pressable, TouchableOpacity } from 'react-native';
import { Trash2 } from 'lucide-react-native';

interface ConfirmDeleteModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({
  visible,
  title = 'Delete Item',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View className="bg-white rounded-2xl p-5 w-full max-w-xs items-center">
          {/* Icon */}
          <View className="w-14 h-14 rounded-full bg-red-100 items-center justify-center mb-4">
            <Trash2 color="#DC2626" size={28} />
          </View>

          {/* Title */}
          <Text className="text-lg font-bold text-center text-gray-900 mb-2">
            {title}
          </Text>

          {/* Message */}
          <Text className="text-sm text-center text-gray-500 mb-4">
            {message}
          </Text>

          {/* Buttons */}
          <View className="flex-row w-full space-x-2">
            <Pressable
              onPress={onCancel}
              className="flex-1 border border-gray-300 rounded-lg py-2 items-center justify-center"
            >
              <Text className="text-gray-700 font-medium">Cancel</Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              className="flex-1 ml-2 bg-red-600 rounded-lg py-2 items-center justify-center"
            >
              <Text className="text-white font-medium">Delete</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

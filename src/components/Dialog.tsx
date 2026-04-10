// components/Dialog.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native';

interface DialogProps {
  visible: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  closeOnOutsidePress?: boolean;
  children?: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({
  visible,
  title,
  message,
  onClose,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = true,
  closeOnOutsidePress = true,
  children,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center"
        onPress={closeOnOutsidePress ? onClose : undefined}
      >
        {/* Stop click inside dialog */}
        <Pressable className="w-80 bg-white rounded-2xl p-5">
          {/* Title */}
          {title && <Text className="text-lg font-bold mb-2">{title}</Text>}

          {/* Message */}
          {message && <Text className="text-gray-600 mb-4">{message}</Text>}

          {/* Custom Content */}
          {children}

          {/* Actions */}
          <View className="flex-row justify-end mt-4 space-x-2">
            {showCancel && (
              <TouchableOpacity
                onPress={onClose}
                className="px-4 py-2 rounded-lg bg-gray-200"
              >
                <Text className="text-gray-800 font-semibold">
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onConfirm}
              className="px-4 py-2 rounded-lg bg-blue-500"
            >
              <Text className="text-white font-semibold">{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default Dialog;

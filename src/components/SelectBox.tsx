import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';

type SelectBoxProps = {
  options: { label: string; value: string | number }[];
  selectedValue?: string | number;
  placeholder?: string;
  onValueChange?: (value: string | number) => void;
  onOpen?: () => void;
  className?: string;
};

export default function SelectBox({
  options,
  selectedValue,
  placeholder = 'Pilih...',
  onValueChange,
  onOpen,
  className,
}: SelectBoxProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel =
    options.find(o => o.value === selectedValue)?.label || placeholder;

  return (
    <View className={`w-full ${className}`}>
      {/* Button */}
      <Pressable
        className="border border-gray-300 rounded-lg px-4 py-3 bg-white flex-row justify-between items-center"
        onPress={() => {
          setIsOpen(true);
          onOpen?.();
        }}
      >
        <Text className={`${selectedValue ? 'text-black' : 'text-gray-400'}`}>
          {selectedLabel}
        </Text>

        {/* ICON LUCIDE */}
        <ChevronDown size={20} color="#6B7280" />
      </Pressable>

      {/* Modal */}
      <Modal transparent animationType="fade" visible={isOpen}>
        <Pressable
          className="flex-1 bg-black/30 justify-center items-center"
          onPress={() => setIsOpen(false)}
        >
          <View className="bg-white rounded-lg w-11/12 max-h-96 p-2">
            <FlatList
              data={options}
              keyExtractor={item => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="px-4 py-3 rounded-md"
                  onPress={() => {
                    onValueChange?.(item.value);
                    setIsOpen(false);
                  }}
                >
                  <Text className="text-black">{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

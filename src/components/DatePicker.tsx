import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

type DatePickerProps = {
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time';
  label?: string;
};

export default function DatePicker({
  value,
  onChange,
  mode = 'date',
  label,
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false); // hide picker after selection on Android
    if (selectedDate) onChange(selectedDate);
  };

  const formattedDate = value.toLocaleDateString();

  return (
    <View className="my-2">
      {label && <Text className="mb-1 text-base font-medium">{label}</Text>}

      <TouchableOpacity
        className="border border-gray-300 rounded-lg px-4 py-3"
        onPress={() => setShowPicker(true)}
      >
        <Text className="text-base">{formattedDate}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={value}
          mode={mode as 'date' | 'time'} // casting supaya TypeScript aman
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      )}
    </View>
  );
}

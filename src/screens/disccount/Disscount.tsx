import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';

export default function DisscountPage() {
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [applyTo, setApplyTo] = useState<'all' | 'category'>('all');

  return (
    <View className="flex-1 bg-[#0f1a14] px-5 pt-10">
      {/* HEADER */}
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-white text-lg font-semibold">New Discount</Text>
        <Text className="text-gray-400 text-xl">✕</Text>
      </View>

      {/* DISCOUNT NAME */}
      <Field label="Discount Name">
        <TextInput
          value="Flash Sale"
          className="bg-[#16251d] rounded-xl px-4 py-3 text-white"
          placeholderTextColor="#6b7280"
        />
      </Field>

      {/* DISCOUNT TYPE */}
      <Field label="Discount Type">
        <View className="flex-row bg-[#16251d] rounded-xl p-1">
          <ToggleButton
            label="% Percentage"
            active={type === 'percentage'}
            onPress={() => setType('percentage')}
          />
          <ToggleButton
            label="$ Fixed Amount"
            active={type === 'fixed'}
            onPress={() => setType('fixed')}
          />
        </View>
      </Field>

      {/* VALUE */}
      <Field label="Value">
        <View className="border border-green-500 rounded-xl px-4 py-3 flex-row items-center justify-between">
          <Text className="text-white text-xl font-semibold">15</Text>
          <Text className="text-green-400 text-base">%</Text>
        </View>
      </Field>

      {/* APPLY TO */}
      <Field label="Apply to">
        <RadioItem
          label="All Items"
          active={applyTo === 'all'}
          onPress={() => setApplyTo('all')}
        />
        <RadioItem
          label="Specific Category"
          active={applyTo === 'category'}
          onPress={() => setApplyTo('category')}
          disabled
        />
      </Field>

      {/* VALIDITY */}
      <Field label="Validity">
        <View className="flex-row space-x-3">
          <DateBox label="Start Date" value="Oct 24, 2023" />
          <DateBox label="End Date" value="Nov 01, 2023" />
        </View>
      </Field>
    </View>
  );
}

/* ================= COMPONENTS ================= */

function Field({ label, children }: any) {
  return (
    <View className="mb-5">
      <Text className="text-gray-400 text-sm mb-2">{label}</Text>
      {children}
    </View>
  );
}

function ToggleButton({ label, active, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 py-3 rounded-lg items-center ${
        active ? 'bg-green-500' : ''
      }`}
    >
      <Text
        className={`font-medium ${active ? 'text-black' : 'text-gray-400'}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function RadioItem({ label, active, onPress, disabled }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center justify-between rounded-xl px-4 py-4 mb-2 ${
        disabled ? 'bg-[#121f19]' : 'bg-[#16251d]'
      }`}
    >
      <View className="flex-row items-center space-x-3">
        <View className="w-8 h-8 bg-[#24382d] rounded-lg items-center justify-center">
          <Text className="text-green-400">🛒</Text>
        </View>
        <Text
          className={`${disabled ? 'text-gray-500' : 'text-white'} font-medium`}
        >
          {label}
        </Text>
      </View>

      <View
        className={`w-5 h-5 rounded-full border ${
          active ? 'border-green-500' : 'border-gray-600'
        } items-center justify-center`}
      >
        {active && <View className="w-3 h-3 bg-green-500 rounded-full" />}
      </View>
    </TouchableOpacity>
  );
}

function DateBox({ label, value }: any) {
  return (
    <View className="flex-1 bg-[#16251d] rounded-xl px-4 py-3">
      <Text className="text-gray-400 text-xs mb-1">{label}</Text>
      <Text className="text-white">{value}</Text>
    </View>
  );
}

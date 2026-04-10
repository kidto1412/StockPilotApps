import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { DiscountRequest } from '@/interfaces/discount.interface';
import { useDiscountStore } from '@/stores/discount.store';
import { useDiscount } from '@/hooks/discount/useDiscount';
import Input from '@/components/Input';
import ButtonBottom from '@/components/ButtonBottom';
import DatePicker from '@/components/DatePicker';

export default function FormDisscount() {
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [applyTo, setApplyTo] = useState<'all' | 'category'>('all');
  const [form, setForm] = useState<DiscountRequest>({
    name: '',
    description: '',
    valueType: 'PERCENT',
    value: 0,
    startDate: "",
    endDate: "",
  });
  const { create, update } = useDiscount();
  const { discount, reset } = useDiscountStore();

  useEffect(() => {
    if (discount) {
      setForm({
        name: discount.name,
        description: discount.description ?? '',
        valueType: discount.valueType,
        value: discount.value,
        startDate: discount.startDate,
        endDate: discount.endDate,
      });
    }
  }, [discount]);

  const onSubmit = async () => {
    const payload: DiscountRequest = {
    ...form,
    startDate: form.startDate.toISOString(),
    endDate: form.endDate.toISOString(),
  };

    if (!discount) {
      await create(form);
    } else {
      await update(discount.id, form);
    }
    reset();
  };

  return (
    <View className="flex-1 bg-[#0f1a14] px-5 pt-10">
      {/* HEADER */}
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-white text-lg font-semibold">New Discount</Text>
        <Text className="text-gray-400 text-xl">✕</Text>
      </View>

      {/* DISCOUNT NAME */}
      <Field label="Discount Name">
        <Input
          value={form.name}
          onChangeText={text => setForm({ ...form, name: text })}
          className="bg-[#16251d] rounded-xl px-4 py-3 text-white"
          placeholderTextColor="#6b7280"
        />
      </Field>

      <Field label="Description">
        <Input
          value={form.description}
          onChangeText={text => setForm({ ...form, description: text })}
          className="bg-[#16251d] rounded-xl px-4 py-3 text-white"
          placeholderTextColor="#6b7280"
        />
      </Field>

      {/* DISCOUNT TYPE */}
      <Field label="Discount Type">
        <View className="flex-row bg-[#16251d] rounded-xl p-1">
          <ToggleButton
            label="% Percentage"
            active={form.valueType === 'PERCENT'}
            onPress={() => setForm({ ...form, valueType: 'PERCENT' })}
          />
          <ToggleButton
            label="$Fixed Amount"
            active={form.valueType === 'AMOUNT'}
            onPress={() => setForm({ ...form, valueType: 'AMOUNT' })}
          />
        </View>
      </Field>

      {/* VALUE */}
      <Field label="Value">
        <Input
          placeholder="Value"
          keyboardType="numeric"
          value={String(form.value)}
          onChangeText={text => setForm({ ...form, value: Number(text) })}
        />
      </Field>

      {/* VALIDITY */}
      <Field label="Validity">
        <View className="flex-row space-x-3">
          <DatePicker
            label="Start Date"
            value={form.startDate = new Date()}
            onChange={date => setForm({ ...form, startDate: date })}
          />
          <DatePicker
            label="End Date"
            value={form.endDate}
            onChange={date => setForm({ ...form, endDate: date })}
          />
        </View>
      </Field>
      <ButtonBottom title="Simpan" onPress={onSubmit} />
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

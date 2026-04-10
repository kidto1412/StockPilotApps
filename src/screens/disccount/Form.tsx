import ButtonBottom from '@/components/ButtonBottom';
import CurrencyInput from '@/components/CurrencyInput';
import Input from '@/components/Input';
import Screen from '@/components/Screen';
import {
  DiscountRequest,
  DiscountUpdateRequest,
} from '@/interfaces/discount.interface';
import { useToastMessage } from '@/providers/toast.provider';
import { useDiscountStore } from '@/stores/discount.store';
import { useDiscount } from '@/hooks/discount/useDiscount';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function FormDisscount() {
  const { create, update } = useDiscount();
  const { discount, reset } = useDiscountStore();
  const { showToast } = useToastMessage();

  const [form, setForm] = useState<DiscountRequest>({
    name: '',
    description: '',
    valueType: 'PERCENT',
    value: 0,
  });

  useEffect(() => {
    if (!discount) return;

    setForm({
      name: discount.name,
      description: discount.description ?? '',
      valueType: discount.valueType,
      value: discount.value,
    });
  }, [discount]);

  const onSubmit = async () => {
    if (!form.name.trim()) {
      showToast('Nama discount wajib diisi', 'error');
      return;
    }

    if (!Number(form.value) || Number(form.value) <= 0) {
      showToast('Value discount harus lebih dari 0', 'error');
      return;
    }

    if (!discount) {
      await create({
        name: form.name,
        description: form.description,
        valueType: form.valueType,
        value: Number(form.value),
      });
    } else {
      const payload: DiscountUpdateRequest = {
        name: form.name,
        description: form.description,
        valueType: form.valueType,
        value: Number(form.value),
      };
      await update(discount.id, payload);
    }

    reset();
  };

  return (
    <Screen hashMenu={false}>
      <ScrollView
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <Text className="text-white text-xl font-bold mt-3 mb-5">
          {discount ? 'Edit Discount' : 'New Discount'}
        </Text>

        <Input
          label="Discount Name"
          value={form.name}
          onChangeText={text => setForm({ ...form, name: text })}
          placeholder="Diskon Lebaran 10%"
        />

        <Input
          label="Description"
          value={form.description}
          onChangeText={text => setForm({ ...form, description: text })}
          placeholder="Promo lebaran"
        />

        <View className="mb-5">
          <Text className="text-gray-300 mb-2">Value Type</Text>
          <View className="flex-row bg-[#16251d] rounded-xl p-1">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg items-center ${
                form.valueType === 'PERCENT' ? 'bg-green-500' : ''
              }`}
              onPress={() => setForm({ ...form, valueType: 'PERCENT' })}
            >
              <Text
                className={`font-medium ${
                  form.valueType === 'PERCENT' ? 'text-black' : 'text-gray-300'
                }`}
              >
                % Percent
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg items-center ${
                form.valueType === 'AMOUNT' ? 'bg-green-500' : ''
              }`}
              onPress={() => setForm({ ...form, valueType: 'AMOUNT' })}
            >
              <Text
                className={`font-medium ${
                  form.valueType === 'AMOUNT' ? 'text-black' : 'text-gray-300'
                }`}
              >
                Nominal
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {form.valueType === 'AMOUNT' ? (
          <CurrencyInput
            label="Nominal"
            value={String(form.value || '')}
            onChangeValue={value =>
              setForm({
                ...form,
                value: Number(value) || 0,
              })
            }
            placeholder="5000"
          />
        ) : (
          <Input
            label="Value (%)"
            keyboardType="numeric"
            value={String(form.value || '')}
            onChangeText={text =>
              setForm({
                ...form,
                value: Number(text.replace(/[^0-9]/g, '')) || 0,
              })
            }
            placeholder="10"
          />
        )}
      </ScrollView>

      <ButtonBottom title="Simpan" onPress={onSubmit} />
    </Screen>
  );
}

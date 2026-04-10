import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import Input from '@/components/Input';
import ButtonBottom from '@/components/ButtonBottom';
import Screen from '@/components/Screen';

import { SupplierRequest } from '@/interfaces/supplier.interface';
import { useToastMessage } from '@/providers/toast.provider';
import { useSupplier } from '@/hooks/supplier/useSupplier';
import * as yup from 'yup';

export default function SupplierFormPage() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const supplier = route.params?.supplier || null;

  const { create, update } = useSupplier();
  const { showToast } = useToastMessage();
  const emptyToNull = (value: any, originalValue: any) => {
    return originalValue === '' ? null : value;
  };

  const supplierSchema = yup.object().shape({
    name: yup
      .string()
      .transform(emptyToNull)
      .required('Nama supplier wajib diisi'),

    email: yup
      .string()
      .transform(emptyToNull)
      .required('Email supplier wajib diisi')
      .email('Format email tidak valid'),

    phone: yup
      .string()
      .transform(emptyToNull)
      .matches(/^[0-9]+$/, 'Phone harus angka')
      .nullable()
      .required('No Hp supplier wajib diisi'),

    address: yup
      .string()
      .transform(emptyToNull)
      .nullable()
      .required('Alamat supplier wajib diisi'),
  });
  const [errors, setErrors] = useState<any>({});
  const [form, setForm] = useState<SupplierRequest>({
    name: '',
    phone: '',
    email: '',
    address: '',
    storeId: '',
  });

  useEffect(() => {
    if (supplier) {
      setForm(supplier);
    }
  }, [supplier]);

  const onSubmit = async () => {
    try {
      await supplierSchema.validate(form, { abortEarly: false });

      if (!supplier) {
        await create(form);
        showToast('Supplier berhasil dibuat', 'success');
      } else {
        await update(supplier.id, form);
        showToast('Supplier berhasil diupdate', 'success');
      }

      navigation.goBack();
    } catch (err: any) {
      const errorObj: any = {};

      if (err.inner) {
        err.inner.forEach((e: any) => {
          errorObj[e.path] = e.message;
        });
      }

      setErrors(errorObj);
    }
  };

  return (
    <Screen className="flex-1">
      <ScrollView className="flex-1">
        <View className="p-5">
          <Text className="text-white mb-5 font-bold text-2xl">
            Form Supplier
          </Text>

          <View className="mb-5">
            <Input
              placeholder="Nama Supplier"
              value={form.name}
              onChangeText={text => setForm({ ...form, name: text })}
              error={errors.name}
            />

            <Input
              placeholder="Email"
              value={form.email}
              onChangeText={text => setForm({ ...form, email: text })}
              error={errors.email}
            />

            <Input
              placeholder="No Hp"
              value={form.phone}
              onChangeText={text => setForm({ ...form, phone: text })}
              error={errors.phone}
            />

            <Input
              placeholder="Alamat"
              value={form.address}
              onChangeText={text => setForm({ ...form, address: text })}
              error={errors.address}
            />
          </View>
        </View>
      </ScrollView>

      <ButtonBottom title="Simpan" onPress={onSubmit} />
    </Screen>
  );
}

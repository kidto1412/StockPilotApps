import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { Text } from 'react-native';
import { useCategory } from '@/hooks/category/useCategory';
import { CreateCategory } from '../../interfaces/category.interface';
import { useCategoryStore } from '@/stores/category.store';
import Screen from '@/components/Screen';
import ButtonBottom from '@/components/ButtonBottom';

export default function CategoryForm() {
  const [form, setForm] = useState<CreateCategory>({ name: '' });
  const { create, update } = useCategory();

  const { category, reset } = useCategoryStore();
  useEffect(() => {
    if (category) {
      setForm({
        name: category.name,
      });
    }
  }, [category]);

  const onSubmit = async () => {
    if (!category) {
      await create(form);
    } else {
      await update(category.id, form);
    }
    reset();
  };
  return (
    <Screen className="flex-1 ">
      <Text className="font-bold text-lg ml-1 p-5 text-white">
        Form Kategori
      </Text>
      <View className="px-5 mb-5">
        <Input
          placeholder="Name"
          className="mb-5"
          onChangeText={text => setForm({ ...form, name: text })}
          value={form.name}
        />
      </View>

      <ButtonBottom title="Simpan" onPress={onSubmit} />
    </Screen>
  );
}

import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { Text } from 'react-native';
import { useCategory } from '@/hooks/category/useCategory';
import { CreateCategory } from '../../interfaces/category.interface';
import { useCategoryStore } from '@/stores/category.store';

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
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="bg-white">
          <Text className="font-bold text-lg ml-1 p-5">Form Kategori</Text>

          <View className="px-5 mb-5">
            <Input
              placeholder="Name"
              className="mb-5"
              onChangeText={text => setForm({ ...form, name: text })}
              value={form.name}
            />
          </View>

          {/* Button Simpan */}
          <View className="px-5 mb-5">
            <Button title="Simpan" color="primary" onPress={onSubmit} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

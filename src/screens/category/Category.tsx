import React, { useCallback, useState } from 'react';
import { SafeAreaView, View, ScrollView, Text } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Button from '@/components/Button';
import Input from '@/components/Input';
import ListCategoryCard from '@/components/ListCategoryCard';
import { useCategory } from '@/hooks/category/useCategory';
import { CategoryResponse } from '@/interfaces/category.interface';
import { useCategoryStore } from '@/stores/category.store';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import Screen from '@/components/Screen';
import CheckoutBar from '@/components/CheckoutBar';
import ButtonBottom from '@/components/ButtonBottom';

export default function CategoryPage() {
  const { getCategoryPagination, deleteCategory } = useCategory();
  const navigation = useNavigation<any>();
  const [categories, setCategories] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState('');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const categoryStore = useCategoryStore();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fetchCategories = async (pageNumber: number) => {
    const data = await getCategoryPagination({ page: pageNumber, size: 10 });
    if (!data) return;

    if (pageNumber === 1) {
      setCategories(data.content);
    } else {
      setCategories(prev => {
        const newCategories = data.content.filter(
          (u: any) => !prev.some(existing => existing.id === u.id),
        );
        return [...prev, ...newCategories];
      });
    }

    setHasNextPage(data.hasNextPage);
    setPage(pageNumber);
  };

  useFocusEffect(
    useCallback(() => {
      fetchCategories(1);
    }, []),
  );

  const loadMore = () => {
    if (hasNextPage) fetchCategories(page + 1);
  };

  const handleEdit = (category: CategoryResponse | null) => {
    categoryStore.setCategory(category);
    navigation.navigate('FormCategory'); // ganti sesuai route stack
  };

  const handleDelete = (category: CategoryResponse) => {
    setDeleteId(category.id);
    setShowDeleteModal(true);
  };

  const onDeleteConfirm = async () => {
    if (!deleteId) return;
    await deleteCategory(deleteId);
    await fetchCategories(1);
    setShowDeleteModal(false);
  };

  return (
    <Screen className="flex-1">
      {/* Search Input */}
      <View className="px-5 mb-5 mt-5">
        <Input placeholder="Search..." />
      </View>

      {/* List Kategori */}

      {/* <View className="px-5">
          <ListCategoryCard category={categories} onDelete={handleDelete} onEdit={handleEdit}/>
        </View> */}
      <ScrollView
        className="flex-1"
        onScroll={e => {
          const { layoutMeasurement, contentOffset, contentSize } =
            e.nativeEvent;
          if (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 20
          ) {
            loadMore();
          }
        }}
      >
        {categories.length === 0 ? (
          <Text className="text-center text-gray-500 mt-5">
            Tidak ada kategory
          </Text>
        ) : (
          categories.map(category => (
            <View className="mx-5">
              <ListCategoryCard
                key={category.id}
                category={category}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            </View>
          ))
        )}
      </ScrollView>
      <ButtonBottom
        onPress={() => navigation.navigate('FormCategory')}
        title={'Tambah Categori'}
      />
      <ConfirmDeleteModal
        visible={showDeleteModal}
        title="Delete Category"
        message="Are you sure you want to delete this category?"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={onDeleteConfirm}
      />
    </Screen>
  );
}

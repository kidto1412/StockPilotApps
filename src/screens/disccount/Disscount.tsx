import React, { useCallback, useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Input from '@/components/Input';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import Screen from '@/components/Screen';
import ButtonBottom from '@/components/ButtonBottom';
import { useDiscountStore } from '@/stores/discount.store';
import { useDiscount } from '@/hooks/discount/useDiscount';
import { DiscountResponse } from '@/interfaces/discount.interface';
import ListDiscount from '@/components/ListDiscount';

export default function DiscountPage() {
  const { getDiscountPagination, deleteDiscount } = useDiscount();
  const navigation = useNavigation<any>();
  const [discounts, setDiscount] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState('');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const discountStore = useDiscountStore();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fetchDisscount = async (pageNumber: number) => {
    const data = await getDiscountPagination({ page: pageNumber, size: 10 });
    if (!data) return;

    if (pageNumber === 1) {
      setDiscount(data.content);
    } else {
      setDiscount(prev => {
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
      fetchDisscount(1);
    }, []),
  );

  const loadMore = () => {
    if (hasNextPage) fetchDisscount(page + 1);
  };

  const handleEdit = (category: DiscountResponse | null) => {
    discountStore.setDiscount(category);
    navigation.navigate('FormDiscount');
  };

  const handleDelete = (category: DiscountResponse) => {
    setDeleteId(category.id);
    setShowDeleteModal(true);
  };

  const onDeleteConfirm = async () => {
    if (!deleteId) return;
    await deleteDiscount(deleteId);
    await fetchDisscount(1);
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
        {discounts.length === 0 ? (
          <Text className="text-center text-gray-500 mt-5">
            Tidak ada kategory
          </Text>
        ) : (
          discounts.map(discount => (
            <View className="mx-5" key={discount.id}>
              <ListDiscount
                discount={discount}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            </View>
          ))
        )}
      </ScrollView>
      <ButtonBottom
        onPress={() => navigation.navigate('FormDiscount')}
        title={'Tambah Disccount'}
      />
      <ConfirmDeleteModal
        visible={showDeleteModal}
        title="Delete Duscount"
        message="Are you sure you want to delete this Discount?"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={onDeleteConfirm}
      />
    </Screen>
  );
}

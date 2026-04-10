import React, { useState, useCallback } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import Input from '@/components/Input';
import ListSupplierCard from '@/components/ListSupplier';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import ButtonBottom from '@/components/ButtonBottom';
import Screen from '@/components/Screen';
import { useSupplier } from '@/hooks/supplier/useSupplier';

export default function SupplierPage() {
  const { getSupplierPagination, deleteSupplier } = useSupplier();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const navigation = useNavigation<any>();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState('');

  const fetchSuppliers = async (pageNumber: number) => {
    const data = await getSupplierPagination({ page: pageNumber, size: 10 });
    if (!data) return;

    if (pageNumber === 1) {
      setSuppliers(data.content);
    } else {
      setSuppliers(prev => {
        const newData = data.content.filter(
          (s: any) => !prev.some(existing => existing.id === s.id),
        );
        return [...prev, ...newData];
      });
    }

    setHasNextPage(data.hasNextPage);
    setPage(pageNumber);
  };

  useFocusEffect(
    useCallback(() => {
      fetchSuppliers(1);
    }, []),
  );

  const loadMore = () => {
    if (hasNextPage) fetchSuppliers(page + 1);
  };

  const handleEdit = (supplier: any) => {
    navigation.navigate('SupplierForm', { supplier });
  };

  const handleDelete = (supplier: any) => {
    setDeleteId(supplier.id);
    setShowDeleteModal(true);
  };

  const onDeleteConfirm = async () => {
    if (!deleteId) return;
    await deleteSupplier(deleteId);
    await fetchSuppliers(1);
    setShowDeleteModal(false);
  };

  return (
    <Screen className="flex-1">
      <View className="px-5 mt-5">
        <Input placeholder="Search Supplier..." />
      </View>

      <ScrollView
        className="mt-5 px-5"
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
        scrollEventThrottle={16}
      >
        {suppliers.length === 0 ? (
          <Text className="text-center text-gray-500 mt-5">
            Tidak ada supplier
          </Text>
        ) : (
          suppliers.map(item => (
            <ListSupplierCard
              key={item.id}
              supplier={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </ScrollView>

      <ButtonBottom
        title="Tambah Supplier"
        onPress={() => navigation.navigate('SupplierForm')}
      />

      <ConfirmDeleteModal
        visible={showDeleteModal}
        title="Delete Supplier"
        message="Are you sure you want to delete this supplier?"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={onDeleteConfirm}
      />
    </Screen>
  );
}

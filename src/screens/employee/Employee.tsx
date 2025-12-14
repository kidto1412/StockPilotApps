import React, { useState, useCallback } from 'react';
import { SafeAreaView, View, ScrollView, Text } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import Button from '@/components/Button';
import Input from '@/components/Input';
import ListUserCard from '@/components/ListUser';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import { useUser } from '@/hooks/user/useUser';
import { useUserState } from '@/stores/user.store';
import { UserResponse } from '@/interfaces/user.interface';
import ButtonBottom from '@/components/ButtonBottom';
import Screen from '@/components/Screen';

export default function EmployeePage() {
  const { getUserPagination, deleteUser } = useUser();
  const [users, setUsers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const userStore = useUserState();
  const navigation = useNavigation<any>();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState('');

  const fetchUsers = async (pageNumber: number) => {
    const data = await getUserPagination({ page: pageNumber, size: 10 });
    if (!data) return;

    if (pageNumber === 1) {
      setUsers(data.content);
    } else {
      setUsers(prev => {
        const newUsers = data.content.filter(
          (u: any) => !prev.some(existing => existing.id === u.id),
        );
        return [...prev, ...newUsers];
      });
    }

    setHasNextPage(data.hasNextPage);
    setPage(pageNumber);
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers(1);
    }, []),
  );

  const loadMore = () => {
    if (hasNextPage) fetchUsers(page + 1);
  };

  const handleEdit = (user: UserResponse | null) => {
    userStore.setUser(user);
    navigation.navigate('EmployeeForm'); // ganti sesuai route stack
  };

  const handleDelete = (user: UserResponse) => {
    setDeleteId(user.id);
    setShowDeleteModal(true);
  };

  const onDeleteConfirm = async () => {
    if (!deleteId) return;
    await deleteUser(deleteId);
    await fetchUsers(1);
    setShowDeleteModal(false);
  };

  return (
    <Screen className="flex-1 ">
      {/* Tambah Karyawan */}

      {/* Search Input */}
      <View className="px-5 mt-5 ">
        <Input placeholder="Search..." />
      </View>

      {/* List Users */}
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
        {users.length === 0 ? (
          <Text className="text-center text-gray-500 mt-5">
            Tidak ada karyawan
          </Text>
        ) : (
          users.map(user => (
            <ListUserCard
              key={user.id}
              user={user}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </ScrollView>
      <ButtonBottom
        title="Tambah Karyawan"
        onPress={() => navigation.navigate('FormEmployee')}
      />
      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        visible={showDeleteModal}
        title="Delete User"
        message="Are you sure you want to delete this user?"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={onDeleteConfirm}
      />
    </Screen>
  );
}

// hooks/useAuth.ts
import {
  CreateCategory,
  UpdateCategory,
} from '@/interfaces/category.interface';
import { PaginationRequest } from '@/interfaces/pagination.interface';
import { SupplierRequest } from '@/interfaces/supplier.interface';
import { UserRequest } from '@/interfaces/user.interface';
import { useLoading } from '@/providers/loading.provider';
import { useToastMessage } from '@/providers/toast.provider';
import { CategoryEndpoint } from '@/services/endpoints/category.endpoint';
import { SupllierEndpoint } from '@/services/endpoints/supplier.endpoint';

import { UserEndpoint } from '@/services/endpoints/user.endpoint';

import { useSupplierStore } from '@/stores/supplier.store';

import { getErrorMessage } from '@/utils/global-message.util';
import { useNavigation } from '@react-navigation/native';
// import { useRouter } from "expo-router";

export function useSupplier() {
  const { reset } = useSupplierStore();
  //   const router = useRouter();
  const navigation = useNavigation<any>();

  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToastMessage();

  const create = async (data: SupplierRequest) => {
    try {
      showLoading();

      await SupllierEndpoint.create(data);

      showToast('Berhasil 🎉', 'success');

      navigation.goBack();
    } catch (err) {
      const message = getErrorMessage(err);
      showToast(message, 'error');
    } finally {
      hideLoading();
    }
  };
  const update = async (id: string, data: SupplierRequest) => {
    try {
      showLoading();

      await SupllierEndpoint.update(id, data);
      reset();
      //   router.back();
      navigation.goBack();
      showToast('Berhasil 🎉', 'success');
      navigation.navigate('Category');
    } catch (err) {
      const message = getErrorMessage(err);
      showToast(message, 'error');
    } finally {
      hideLoading();
    }
  };

  const getSupplierPagination = async (params: PaginationRequest) => {
    try {
      showLoading();

      const res = await SupllierEndpoint.getPagination(params);
      return res.data;
    } catch (err) {
      const message = getErrorMessage(err);
      showToast(message, 'error');
    } finally {
      hideLoading();
    }
  };

  const getAll = async (params: PaginationRequest) => {
    try {
      showLoading();

      const res = await SupllierEndpoint.getPagination(params);
      return res.data;
    } catch (err) {
      const message = getErrorMessage(err);
      showToast(message, 'error');
    } finally {
      hideLoading();
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      showLoading();

      await UserEndpoint.delete(id);
    } catch (err) {
      const message = getErrorMessage(err);
      showToast(message, 'error');
    } finally {
      hideLoading();
    }
  };

  return { create, getSupplierPagination, deleteSupplier, update, getAll };
}

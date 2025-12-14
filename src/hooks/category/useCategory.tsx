// hooks/useAuth.ts
import {
  CreateCategory,
  UpdateCategory,
} from '@/interfaces/category.interface';
import { PaginationRequest } from '@/interfaces/pagination.interface';
import { UserRequest } from '@/interfaces/user.interface';
import { useLoading } from '@/providers/loading.provider';
import { useToastMessage } from '@/providers/toast.provider';
import { CategoryEndpoint } from '@/services/endpoints/category.endpoint';

import { UserEndpoint } from '@/services/endpoints/user.endpoint';
import { useCategoryStore } from '@/stores/category.store';
import { useUserState } from '@/stores/user.store';

import { getErrorMessage } from '@/utils/global-message.util';
import { useNavigation } from '@react-navigation/native';
// import { useRouter } from "expo-router";

export function useCategory() {
  const { reset } = useCategoryStore();
  //   const router = useRouter();
  const navigation = useNavigation<any>();

  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToastMessage();

  const create = async (data: CreateCategory) => {
    try {
      showLoading();

      await CategoryEndpoint.create(data);

      showToast('Berhasil 🎉', 'success');

      navigation.goBack();
    } catch (err) {
      const message = getErrorMessage(err);
      showToast(message, 'error');
    } finally {
      hideLoading();
    }
  };
  const update = async (id: string, data: UpdateCategory) => {
    try {
      showLoading();

      await CategoryEndpoint.update(id, data);
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

  const getCategoryPagination = async (params: PaginationRequest) => {
    try {
      showLoading();

      const res = await CategoryEndpoint.getPagination(params);
      return res.data;
    } catch (err) {
      const message = getErrorMessage(err);
      showToast(message, 'error');
    } finally {
      hideLoading();
    }
  };

  const deleteCategory = async (id: string) => {
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

  return { create, getCategoryPagination, deleteCategory, update };
}

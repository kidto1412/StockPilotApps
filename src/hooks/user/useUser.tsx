// hooks/useAuth.ts
import { PaginationRequest } from '@/interfaces/pagination.interface';
import { UserRequest } from '@/interfaces/user.interface';
import { useLoading } from '@/providers/loading.provider';
import { useToastMessage } from '@/providers/toast.provider';

import { UserEndpoint } from '@/services/endpoints/user.endpoint';
import { useUserState } from '@/stores/user.store';

import { getErrorMessage } from '@/utils/global-message.util';
// import { useRouter } from "expo-router";

export function useUser() {
  const { user, reset } = useUserState();
  //   const router = useRouter();

  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToastMessage();

  const create = async (data: UserRequest) => {
    try {
      showLoading();

      await UserEndpoint.create(data);

      showToast('Berhasil 🎉', 'success');
      //   router.back();
    } catch (err) {
      const message = getErrorMessage(err);
      showToast(message, 'error');
    } finally {
      hideLoading();
    }
  };
  const update = async (id: string, data: UserRequest) => {
    try {
      showLoading();

      await UserEndpoint.update(id, data);
      reset();
      //   router.back();
      showToast('Berhasil 🎉', 'success');
    } catch (err) {
      const message = getErrorMessage(err);
      showToast(message, 'error');
    } finally {
      hideLoading();
    }
  };

  const getUserPagination = async (params: PaginationRequest) => {
    try {
      showLoading();

      const res = await UserEndpoint.getPagination(params);
      return res.data;
    } catch (err) {
      const message = getErrorMessage(err);
      showToast(message, 'error');
    } finally {
      hideLoading();
    }
  };

  const deleteUser = async (id: string) => {
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

  return { create, getUserPagination, deleteUser, update };
}

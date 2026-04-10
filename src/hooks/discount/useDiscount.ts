import { DiscountRequest } from '@/interfaces/discount.interface';
import { PaginationRequest } from '@/interfaces/pagination.interface';

import { useLoading } from '@/providers/loading.provider';
import { useToastMessage } from '@/providers/toast.provider';
import { DiscountEndpoint } from '@/services/endpoints/discount.endpoint';
import { useDiscountStore } from '@/stores/discount.store';

import { getErrorMessage } from '@/utils/global-message.util';
import { useNavigation } from '@react-navigation/native';

export function useDiscount() {
  const { reset } = useDiscountStore();
  const navigation = useNavigation<any>();

  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToastMessage();

  const create = async (data: DiscountRequest) => {
    try {
      showLoading();
      console.log(data, 'payload dis');

      await DiscountEndpoint.create(data);

      showToast('Berhasil 🎉', 'success');
      navigation.goBack();
    } catch (err) {
      const message = getErrorMessage(err);
      showToast(message, 'error');
    } finally {
      hideLoading();
    }
  };

  const update = async (id: string, data: DiscountRequest) => {
    try {
      showLoading();

      await DiscountEndpoint.update(id, data);
      reset();

      showToast('Berhasil 🎉', 'success');
      navigation.navigate('Discount');
    } catch (err) {
      const message = getErrorMessage(err);
      showToast(message, 'error');
    } finally {
      hideLoading();
    }
  };

  const getDiscountPagination = async (params: PaginationRequest) => {
    try {
      showLoading();

      const res = await DiscountEndpoint.getPagination(params);
      console.log(res.data, 'disscounts');
      return res.data;
    } catch (err) {
      const message = getErrorMessage(err);
      showToast(message, 'error');
    } finally {
      hideLoading();
    }
  };

  const getAll = async () => {
    try {
      showLoading();

      const res = await DiscountEndpoint.getAll();
      return res.data;
    } catch (err) {
      const message = getErrorMessage(err);
      showToast(message, 'error');
    } finally {
      hideLoading();
    }
  };

  const deleteDiscount = async (id: string) => {
    try {
      showLoading();

      await DiscountEndpoint.delete(id);

      showToast('Berhasil 🎉', 'success');
      reset();
    } catch (err) {
      const message = getErrorMessage(err);
      showToast(message, 'error');
    } finally {
      hideLoading();
    }
  };

  return {
    create,
    update,
    getDiscountPagination,
    getAll,
    deleteDiscount,
  };
}

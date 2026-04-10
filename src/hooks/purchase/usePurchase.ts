import { CreatePurchaseRequest } from '@/interfaces/purchase.interface';
import { useLoading } from '@/providers/loading.provider';
import { useToastMessage } from '@/providers/toast.provider';
import { PurchaseEndpoint } from '@/services/endpoints/purchase.endpoint';
import { getErrorMessage } from '@/utils/global-message.util';

export function usePurchase() {
  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToastMessage();

  const createPurchase = async (payload: CreatePurchaseRequest) => {
    try {
      showLoading();
      const res = await PurchaseEndpoint.create(payload);
      showToast('Pembelian berhasil dibuat', 'success');
      return res;
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
      return null;
    } finally {
      hideLoading();
    }
  };

  return { createPurchase };
}

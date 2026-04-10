import { CreateTransactionRequest } from '@/interfaces/transaction.interface';
import { useLoading } from '@/providers/loading.provider';
import { useToastMessage } from '@/providers/toast.provider';
import { TransactionEndpoint } from '@/services/endpoints/transaction.endpoint';
import { getErrorMessage } from '@/utils/global-message.util';

export function useTransaction() {
  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToastMessage();

  const createTransaction = async (payload: CreateTransactionRequest) => {
    try {
      showLoading();
      const res = await TransactionEndpoint.create(payload);
      showToast('Transaksi berhasil dibuat', 'success');
      return res;
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
      return null;
    } finally {
      hideLoading();
    }
  };

  return { createTransaction };
}

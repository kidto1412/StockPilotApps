import { useLoading } from '@/providers/loading.provider';
import { useToastMessage } from '@/providers/toast.provider';
import { StockMovementEndpoint } from '@/services/endpoints/stock-movement.endpoint';
import {
  StockMovementHistoryData,
  StockMovementHistoryParams,
} from '@/interfaces/stock-movement.interface';
import { getErrorMessage } from '@/utils/global-message.util';

export function useStockMovement() {
  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToastMessage();

  const getHistory = async (
    params: StockMovementHistoryParams,
  ): Promise<StockMovementHistoryData | null> => {
    try {
      showLoading();
      const res = await StockMovementEndpoint.getHistory(params);
      return res.data.data;
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
      return null;
    } finally {
      hideLoading();
    }
  };

  return { getHistory };
}

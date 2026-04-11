import {
  StockMovementHistoryParams,
  StockMovementHistoryResponse,
} from '@/interfaces/stock-movement.interface';
import api from '@/services/api';

export const StockMovementEndpoint = {
  getHistory(params: StockMovementHistoryParams) {
    return api.get<StockMovementHistoryResponse>('/stock-movements/history', {
      params,
    });
  },
};

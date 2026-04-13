import {
  DashboardSummaryParams,
  DashboardSummaryResponse,
} from '@/interfaces/dashboard.interface';
import { useToastMessage } from '@/providers/toast.provider';
import { DashboardEndpoint } from '@/services/endpoints/dashboard.endpoint';
import { getErrorMessage } from '@/utils/global-message.util';
import { useState } from 'react';

export function useDashboard() {
  const { showToast } = useToastMessage();
  const [isLoading, setIsLoading] = useState(false);

  const getSummary = async (
    params?: DashboardSummaryParams,
  ): Promise<DashboardSummaryResponse | null> => {
    try {
      setIsLoading(true);
      const res = await DashboardEndpoint.getSummary(params);
      console.log(res);
      return res.data;
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { getSummary, isLoading };
}

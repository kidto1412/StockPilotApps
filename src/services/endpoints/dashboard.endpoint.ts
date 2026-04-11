import {
  DashboardSummaryParams,
  DashboardSummaryResponse,
} from '@/interfaces/dashboard.interface';
import { GET } from '@/utils/api.util';

export const DashboardEndpoint = {
  getSummary(params?: DashboardSummaryParams) {
    return GET<DashboardSummaryResponse>('/dashboard/summary', { params });
  },
};

import {
  SalesChartParams,
  SalesChartResponse,
  SalesReportParams,
  SalesReportResponse,
} from '@/interfaces/sales-report.interface';
import api from '@/services/api';

export const SalesReportEndpoint = {
  getPagination(params: SalesReportParams) {
    return api.get<SalesReportResponse>('/transactions/sales/pagination', {
      params,
    });
  },
  getChart(params: SalesChartParams) {
    return api.get<SalesChartResponse>('/transactions/sales/chart', {
      params,
    });
  },
};

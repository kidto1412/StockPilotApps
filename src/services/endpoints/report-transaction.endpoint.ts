import {
  ExportReportTransactionParams,
  ReportTransactionItem,
  ReportTransactionParams,
} from '@/interfaces/report-transaction.interface';
import api from '@/services/api';
import { GET_PAGINATED } from '@/utils/api.util';

export const ReportTransactionEndpoint = {
  getPagination: async (params: ReportTransactionParams) => {
    return GET_PAGINATED<ReportTransactionItem>('/report-transaction', {
      params,
    });
  },

  exportReport: async (params: ExportReportTransactionParams) => {
    return api.get('/report-transaction/export', {
      params,
      responseType: 'blob',
    });
  },
};

import {
  ExportReportTransactionParams,
  ReportTransactionParams,
} from '@/interfaces/report-transaction.interface';
import { useLoading } from '@/providers/loading.provider';
import { useToastMessage } from '@/providers/toast.provider';
import { ReportTransactionEndpoint } from '@/services/endpoints/report-transaction.endpoint';
import { getErrorMessage } from '@/utils/global-message.util';

export function useReportTransaction() {
  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToastMessage();

  const getReportTransaction = async (params: ReportTransactionParams) => {
    try {
      showLoading();
      const res = await ReportTransactionEndpoint.getPagination(params);
      return res.data;
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
      return null;
    } finally {
      hideLoading();
    }
  };

  const exportReportTransaction = async (
    params: ExportReportTransactionParams,
  ) => {
    try {
      showLoading();
      await ReportTransactionEndpoint.exportReport(params);
      showToast(`Export ${params.format} berhasil diproses`, 'success');
      return true;
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
      return false;
    } finally {
      hideLoading();
    }
  };

  return { getReportTransaction, exportReportTransaction };
}

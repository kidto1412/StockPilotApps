import {
  ExportReportTransactionParams,
  ReportTransactionParams,
} from '@/interfaces/report-transaction.interface';
import { PaginationResponse } from '@/interfaces/base_respone.interface';
import { useLoading } from '@/providers/loading.provider';
import { useToastMessage } from '@/providers/toast.provider';
import { ReportTransactionEndpoint } from '@/services/endpoints/report-transaction.endpoint';
import { getErrorMessage } from '@/utils/global-message.util';
import { Share } from 'react-native';

const blobToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export function useReportTransaction() {
  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToastMessage();

  const getReportTransaction = async (
    params: ReportTransactionParams,
  ): Promise<PaginationResponse<any> | null> => {
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
      const isExcelFormat =
        params.format === 'EXCEL' || params.format === 'XLSX';
      const formatCandidates = isExcelFormat
        ? ['EXCEL', 'XLSX']
        : [params.format];

      let res: any = null;
      let usedFormat: string = params.format;
      let lastErr: any = null;

      for (const candidate of formatCandidates) {
        try {
          res = await ReportTransactionEndpoint.exportReport({
            ...params,
            format: candidate as ExportReportTransactionParams['format'],
          });
          usedFormat = candidate;
          lastErr = null;
          break;
        } catch (err) {
          lastErr = err;
        }
      }

      if (!res) {
        throw lastErr;
      }

      const extension = usedFormat === 'PDF' ? 'pdf' : 'xlsx';
      const fallbackMime =
        usedFormat === 'PDF'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      const mimeType =
        (res.headers?.['content-type'] as string | undefined) ??
        (res.headers?.['Content-Type'] as string | undefined) ??
        fallbackMime;

      const blob = new Blob([res.data]);
      const dataUrl = await blobToDataUrl(blob);

      const fileName = `report-transaction-${params.groupBy.toLowerCase()}-${params.startDate}-${params.endDate}.${extension}`;

      await Share.share({
        title: fileName,
        url: dataUrl,
        message: `Simpan file ${fileName}`,
      });

      showToast(
        `Export ${usedFormat} berhasil. Silakan simpan file dari menu share.`,
        'success',
      );
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

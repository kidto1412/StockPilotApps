import { useLoading } from '@/providers/loading.provider';
import { useToastMessage } from '@/providers/toast.provider';
import { SalesReportEndpoint } from '@/services/endpoints/sales-report.endpoint';
import {
  SalesChartData,
  SalesChartParams,
  SalesReportParams,
  SalesReportData,
} from '@/interfaces/sales-report.interface';
import { getErrorMessage } from '@/utils/global-message.util';

export function useSalesReport() {
  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToastMessage();

  const normalizeSalesChart = (raw: any): SalesChartData => {
    const source = raw?.data ?? raw ?? {};
    const content = Array.isArray(source?.content) ? source.content : [];
    const summary = source?.summary ?? {};

    const normalizedContent = content.map((item: any) => ({
      period: String(item?.period ?? '-'),
      totalRevenue: Number(item?.totalRevenue ?? 0),
      totalCost: Number(item?.totalCost ?? 0),
      totalProfit: Number(item?.totalProfit ?? 0),
      totalLoss: Number(item?.totalLoss ?? 0),
    }));

    return {
      groupBy: source?.groupBy ?? 'DAILY',
      content: normalizedContent,
      summary: {
        totalRevenue: Number(summary?.totalRevenue ?? 0),
        totalCost: Number(summary?.totalCost ?? 0),
        totalProfit: Number(summary?.totalProfit ?? 0),
        totalLoss: Number(summary?.totalLoss ?? 0),
      },
    };
  };

  const normalizeSalesReport = (raw: any): SalesReportData => {
    const lvl0 = raw ?? {};
    const lvl1 = lvl0?.data ?? lvl0;
    const lvl2 = lvl1?.data ?? lvl1;

    const source =
      lvl2?.content || lvl2?.summary || lvl2?.soldProducts ? lvl2 : lvl1;

    const transactions = Array.isArray(source)
      ? source
      : Array.isArray(source?.content)
        ? source.content
        : Array.isArray(source?.data)
          ? source.data
          : [];
    const hasTransactionShape =
      transactions.length > 0 && Array.isArray(transactions[0]?.items);

    let normalizedContent = (source?.soldProducts ?? []).map((item: any) => ({
      productId: item?.productId ?? item?.id ?? '',
      productName: item?.productName ?? item?.name ?? '-',
      barcode: item?.barcode ?? null,
      totalQuantity: Number(item?.totalQuantity ?? item?.qty ?? 0),
      totalRevenue: Number(item?.totalRevenue ?? item?.revenue ?? 0),
      totalCost: Number(item?.totalCost ?? item?.cost ?? 0),
      totalProfit: Number(item?.totalProfit ?? item?.profit ?? 0),
    }));

    if (hasTransactionShape) {
      const map = new Map<
        string,
        {
          productId: string;
          productName: string;
          barcode: string | null;
          totalQuantity: number;
          totalRevenue: number;
          totalCost: number;
          totalProfit: number;
        }
      >();

      transactions.forEach((trx: any) => {
        const trxItems = Array.isArray(trx?.items) ? trx.items : [];
        trxItems.forEach((item: any) => {
          const productId = String(item?.productId ?? item?.itemId ?? '');
          const key =
            productId || `${item?.productName ?? '-'}-${item?.itemId ?? ''}`;

          const quantity = Number(item?.quantity ?? 0);
          const revenue = Number(item?.soldLineTotal ?? item?.subtotal ?? 0);
          const cost = Number(item?.originalLineTotal ?? 0);
          const profit = Number(
            item?.profit ?? item?.totalProfit ?? revenue - cost,
          );

          const prev = map.get(key) ?? {
            productId,
            productName: item?.productName ?? '-',
            barcode: item?.barcode ?? null,
            totalQuantity: 0,
            totalRevenue: 0,
            totalCost: 0,
            totalProfit: 0,
          };

          prev.totalQuantity += quantity;
          prev.totalRevenue += revenue;
          prev.totalCost += cost;
          prev.totalProfit += profit;

          map.set(key, prev);
        });
      });

      normalizedContent = Array.from(map.values());
    } else if (normalizedContent.length === 0) {
      normalizedContent = transactions.map((item: any) => ({
        productId: item?.productId ?? item?.id ?? '',
        productName: item?.productName ?? item?.name ?? '-',
        barcode: item?.barcode ?? null,
        totalQuantity: Number(item?.totalQuantity ?? item?.qty ?? 0),
        totalRevenue: Number(item?.totalRevenue ?? item?.revenue ?? 0),
        totalCost: Number(item?.totalCost ?? item?.cost ?? 0),
        totalProfit: Number(item?.totalProfit ?? item?.profit ?? 0),
      }));
    }

    const summary = source?.summary ?? lvl1?.summary ?? {};
    const totalSoldQuantity = Number(
      summary?.totalSoldQuantity ??
        summary?.totalQuantity ??
        normalizedContent.reduce(
          (acc: number, item: any) => acc + (item.totalQuantity || 0),
          0,
        ),
    );
    const totalSalesAmount = Number(
      summary?.totalSalesAmount ??
        summary?.totalRevenue ??
        source?.totalSalesAmount ??
        0,
    );
    const totalCost = Number(summary?.totalCost ?? source?.totalCost ?? 0);
    const totalProfit = Number(
      summary?.totalProfit ??
        source?.totalProfit ??
        totalSalesAmount - totalCost,
    );

    return {
      content: normalizedContent,
      summary: {
        totalSalesAmount,
        totalCost,
        totalProfit,
        totalSoldProducts: Number(
          summary?.totalSoldProducts ?? normalizedContent.length,
        ),
        totalSoldQuantity,
      },
      totalSalesAmount,
      totalCost,
      totalProfit,
      soldProducts: normalizedContent,
    };
  };

  const getSalesReport = async (
    params: SalesReportParams,
  ): Promise<SalesReportData | null> => {
    try {
      showLoading();
      const res = await SalesReportEndpoint.getPagination(params);
      console.log(res);
      return normalizeSalesReport((res as any)?.data);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
      return null;
    } finally {
      hideLoading();
    }
  };

  const getSalesChart = async (
    params: SalesChartParams,
  ): Promise<SalesChartData | null> => {
    try {
      showLoading();
      const res = await SalesReportEndpoint.getChart(params);
      return normalizeSalesChart((res as any)?.data);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
      return null;
    } finally {
      hideLoading();
    }
  };

  return { getSalesReport, getSalesChart };
}

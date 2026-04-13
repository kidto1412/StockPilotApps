export type SalesTransactionStatus = 'DRAFT' | 'COMPLETED' | 'CANCELED';
export type SalesStatusFilter = 'ALL' | SalesTransactionStatus;

export interface SalesReportParams {
  page?: string | number;
  size?: string | number;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  status?: SalesTransactionStatus;
}

export type SalesChartGroupBy = 'DAILY' | 'MONTHLY' | 'YEARLY';

export interface SalesChartParams {
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  groupBy?: SalesChartGroupBy;
  status?: SalesTransactionStatus;
}

export interface SalesChartPeriodItem {
  period: string;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalLoss: number;
}

export interface SalesChartSummary {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalLoss: number;
}

export interface SalesChartData {
  groupBy: SalesChartGroupBy;
  content: SalesChartPeriodItem[];
  summary: SalesChartSummary;
}

export interface SoldProductItem {
  productId: string;
  productName: string;
  barcode?: string | null;
  totalQuantity: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
}

export interface SalesReportSummary {
  totalSalesAmount: number;
  totalCost: number;
  totalProfit: number;
  totalSoldProducts: number;
  totalSoldQuantity: number;
}

export interface SalesReportData {
  content?: SoldProductItem[];
  summary?: SalesReportSummary;

  // Backward compatibility fields
  totalSalesAmount: number;
  totalCost: number;
  totalProfit: number;
  soldProducts?: SoldProductItem[];
}

export interface SalesReportResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SalesReportData;
}

export interface SalesChartResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SalesChartData;
}

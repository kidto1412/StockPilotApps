export interface ReportTransactionParams {
  page: number;
  size: number;
  startDate: string;
  endDate: string;
  paymentMethod?: string;
  status?: string;
}

export interface ReportTransactionItem {
  id: string;
  invoiceNumber?: string;
  paymentMethod: string;
  status: string;
  totalAmount?: number;
  createdAt?: string;
}

export interface ExportReportTransactionParams {
  groupBy: 'DAILY' | 'MONTHLY';
  format: 'EXCEL' | 'PDF';
  startDate: string;
  endDate: string;
}

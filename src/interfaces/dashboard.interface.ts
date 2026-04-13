export interface DashboardSummaryParams {
  startDate?: string;
  endDate?: string;
}

export interface DashboardSummaryResponse {
  totalProducts: number;
  totalCategories: number;
  totalSold: number;
  totalSalesAmount: number;
}

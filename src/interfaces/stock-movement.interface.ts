export type StockMovementType = 'IN' | 'OUT';

export interface StockMovementHistoryParams {
  page?: number;
  size?: number;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  type?: StockMovementType;
}

export interface StockMovementSummary {
  totalIn: number;
  totalOut: number;
  net: number;
}

export interface StockMovementItem {
  id: string;
  productId: string;
  storeId: string;
  quantity: number;
  type: StockMovementType;
  source: string;
  referenceId?: string | null;
  note?: string | null;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    barcode?: string;
    category?: {
      id: string;
      name: string;
    };
  };
  supplier?: {
    id: string;
    name: string;
  };
  reference?: {
    id: string;
    invoiceNumber?: string;
    supplierId?: string;
    createdAt?: string;
  };
}

export interface StockMovementHistoryData {
  content: StockMovementItem[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  summary: StockMovementSummary;
}

export interface StockMovementHistoryResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: StockMovementHistoryData;
}

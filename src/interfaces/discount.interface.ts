export interface DiscountResponse {
  id: string;
  name: string;
  description?: string;
  storeId: string;
  valueType: 'PERCENT' | 'AMOUNT';
  value: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  startDate: string; // ISO string
  endDate: string; // ISO string
}

export interface DiscountRequest {
  name: string;
  description: string;
  valueType: 'PERCENT' | 'AMOUNT';
  value: number;
  startDate: string; // ISO string
  endDate: string; // ISO string
}

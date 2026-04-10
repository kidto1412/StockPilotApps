export interface DiscountResponse {
  id: string;
  name: string;
  description?: string | null;
  storeId: string;
  valueType: 'PERCENT' | 'AMOUNT';
  value: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface DiscountDetailResponse extends DiscountResponse {
  productRelations?: {
    id: string;
    productId: string;
    discountId: string;
    product?: {
      id: string;
      name: string;
      price: number;
      stock: number;
    };
  }[];
}

export interface DiscountRequest {
  name: string;
  description?: string;
  valueType: 'PERCENT' | 'AMOUNT';
  value: number;
}

export type DiscountUpdateRequest = Partial<DiscountRequest>;

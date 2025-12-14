export interface CreateProduct {
  // id: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  cost: number;
  price: number;
  stock: number;
  image?: string | null;
  categoryId?: string | null;
}
export interface ProductResponse {
  id: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  cost: number;
  price: number;
  stock: number;
  imageUrl?: string | null;
  isActive: boolean;
  categoryId?: string | null;
  storeId?: string | null;
}

export interface SupplierRequest {
  id?: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  storeId: string;
}

export interface SupplierResponse extends SupplierRequest {
  createdAt?: string;
  updatedAt?: string;
}

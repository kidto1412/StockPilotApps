export interface PurchaseItemRequest {
  productId: string;
  quantity: number;
  cost: number;
}

export interface CreatePurchaseRequest {
  supplierId: string;
  items: PurchaseItemRequest[];
}

export interface TransactionItemRequest {
  productId: string;
  quantity: number;
}

export interface CreateTransactionRequest {
  paymentMethod: string;
  discount: number;
  paidAmount: number;
  items: TransactionItemRequest[];
}

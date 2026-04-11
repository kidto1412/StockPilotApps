export type HistoryCardProps = {
  id: string;
  type: 'IN' | 'OUT';
  quantity: number;
  source: string;
  productName: string;
  categoryName?: string;
  supplierName?: string;
  invoiceNumber?: string;
  note?: string;
  createdAt: string;
};

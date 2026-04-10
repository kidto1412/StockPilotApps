import { CreatePurchaseRequest } from '@/interfaces/purchase.interface';
import { POST } from '@/utils/api.util';

export const PurchaseEndpoint = {
  create: async (data: CreatePurchaseRequest) => {
    return POST('/purchases', data);
  },
};

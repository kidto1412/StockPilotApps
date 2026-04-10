import { CreateTransactionRequest } from '@/interfaces/transaction.interface';
import { POST } from '@/utils/api.util';

export const TransactionEndpoint = {
  create: async (data: CreateTransactionRequest) => {
    return POST('/transactions', data);
  },
};

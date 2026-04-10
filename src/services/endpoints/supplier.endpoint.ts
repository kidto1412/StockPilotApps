import { PaginationRequest } from '@/interfaces/pagination.interface';
import { ProductResponse } from '@/interfaces/product.interface';
import { SupplierRequest } from '@/interfaces/supplier.interface';
import { DELETE, GET_PAGINATED, POST, PUT } from '@/utils/api.util';

export const SupllierEndpoint = {
  create: async (data: SupplierRequest) => {
    return POST('/suppliers', data);
  },

  update: async (id: string, data: SupplierRequest) => {
    return PUT(`/suppliers/${id}`, data);
  },

  delete: async (id: string) => {
    return DELETE(`/suppliers/${id}`);
  },

  getPagination: async (params: PaginationRequest) => {
    return GET_PAGINATED<ProductResponse>(`/suppliers/pagination`, { params });
  },
};

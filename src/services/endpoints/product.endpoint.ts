import { PaginationRequest } from '@/interfaces/pagination.interface';
import { ProductResponse } from '@/interfaces/product.interface';
import { DELETE, GET, GET_PAGINATED, POST, PUT } from '@/utils/api.util';

export const ProductEndpoint = {
  create: async (formData: FormData) => {
    return POST('/product', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  update: async (id: string, formData: FormData) => {
    return PUT(`/product/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  delete: async (id: string) => {
    return DELETE(`/product/${id}`);
  },

  getPagination: async (params: PaginationRequest) => {
    return GET_PAGINATED<ProductResponse>(`/product/pagination`, { params });
  },
};

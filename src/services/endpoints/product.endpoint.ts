import { PaginationRequest } from '@/interfaces/pagination.interface';
import { ProductResponse } from '@/interfaces/product.interface';
import {
  DELETE,
  GET,
  GET_PAGINATED,
  POST,
  POST_MULTI_PART_FORM,
  PUT,
} from '@/utils/api.util';

export const ProductEndpoint = {
  create: async (formData: FormData) => {
    return POST_MULTI_PART_FORM('/product', formData);
  },

  update: async (id: string, formData: FormData) => {
    return PUT(`/product/${id}`, formData);
  },

  delete: async (id: string) => {
    return DELETE(`/product/${id}`);
  },

  getPagination: async (params: PaginationRequest) => {
    return GET_PAGINATED<ProductResponse>(`/product/pagination`, { params });
  },
};

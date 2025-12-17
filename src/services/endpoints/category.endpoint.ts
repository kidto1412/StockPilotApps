import {
  CategoryResponse,
  CreateCategory,
  UpdateCategory,
} from '@/interfaces/category.interface';
import { PaginationRequest } from '@/interfaces/pagination.interface';

import { DELETE, GET, GET_PAGINATED, POST, PUT } from '@/utils/api.util';

export const CategoryEndpoint = {
  create(payload: CreateCategory) {
    return POST('/category', payload);
  },
  getPagination(params: PaginationRequest) {
    return GET_PAGINATED<CategoryResponse>('/category/pagination', { params });
  },
  getAll() {
    return GET<CategoryResponse[]>('/category');
  },
  update(id: string, payload: UpdateCategory) {
    return PUT(`/category/${id}`, payload);
  },
  delete(id: string) {
    return DELETE(`/category/${id}`);
  },
};

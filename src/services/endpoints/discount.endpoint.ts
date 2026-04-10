import { PaginationRequest } from '@/interfaces/pagination.interface';
import api from '../api';
import {
  DiscountRequest,
  DiscountResponse,
} from '@/interfaces/discount.interface';
import { GET, GET_PAGINATED, POST, PUT, DELETE } from '@/utils/api.util';
import { PaginationResponse } from '@/interfaces/base_respone.interface';

export const DiscountEndpoint = {
  getAll() {
    return GET('/discounts');
  },

  getPagination(params: PaginationRequest) {
    return GET_PAGINATED<DiscountResponse>('/discounts/pagination', {
      params,
    });
  },

  create(data: DiscountRequest) {
    return POST('/discounts', data);
  },

  update(id: string, data: DiscountRequest) {
    return PUT(`/discounts/${id}`, data);
  },

  delete(id: string) {
    return DELETE(`/discounts/${id}`);
  },
};

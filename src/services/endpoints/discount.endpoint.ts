import { PaginationRequest } from '@/interfaces/pagination.interface';
import api from '../api';
import {
  DiscountDetailResponse,
  DiscountRequest,
  DiscountResponse,
  DiscountUpdateRequest,
} from '@/interfaces/discount.interface';
import { GET, GET_PAGINATED, POST, PATCH, DELETE } from '@/utils/api.util';
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

  getDetail(id: string) {
    return GET<DiscountDetailResponse>(`/discounts/${id}`);
  },

  create(data: DiscountRequest) {
    return POST('/discounts', data);
  },

  update(id: string, data: DiscountUpdateRequest) {
    return PATCH(`/discounts/${id}`, data);
  },

  delete(id: string) {
    return DELETE(`/discounts/${id}`);
  },
};

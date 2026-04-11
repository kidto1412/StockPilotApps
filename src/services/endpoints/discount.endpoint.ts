import { PaginationRequest } from '@/interfaces/pagination.interface';
import api from '../api';
import {
  DiscountDetailResponse,
  DiscountRequest,
  DiscountResponse,
  DiscountUpdateRequest,
  DiscountOperationResponse,
} from '@/interfaces/discount.interface';
import { GET, GET_PAGINATED, POST, PATCH, DELETE } from '@/utils/api.util';
import {
  PaginationResponse,
  APIResponse,
} from '@/interfaces/base_respone.interface';

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
    return POST<null>('/discounts', data) as Promise<APIResponse<null>>;
  },

  update(id: string, data: DiscountUpdateRequest) {
    return PATCH<null>(`/discounts/${id}`, data) as Promise<APIResponse<null>>;
  },

  delete(id: string) {
    return DELETE<null>(`/discounts/${id}`) as Promise<APIResponse<null>>;
  },
};

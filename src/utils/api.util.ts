// src/api/http.ts

import {
  APIResponse,
  BasePaginationResponse,
} from '@/interfaces/base_respone.interface';
import api from '@/services/api';

export async function GET<T>(url: string, config: object = {}) {
  const res = await api.get<APIResponse<T>>(url, config);
  return res.data; // langsung APIResponse<T>
}

export async function POST<T>(url: string, body: any, config: object = {}) {
  const res = await api.post<APIResponse<T>>(url, body, config);
  return res.data;
}

export async function POST_MULTI_PART_FORM<T>(url: string, body: any) {
  const res = await api.post<APIResponse<T>>(url, body, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

export async function PUT<T>(url: string, body: any, config: object = {}) {
  const res = await api.put<APIResponse<T>>(url, body, config);
  return res.data;
}

export async function PATCH<T>(url: string, body: any, config: object = {}) {
  const res = await api.patch<APIResponse<T>>(url, body, config);
  return res.data;
}

export async function DELETE<T>(url: string, config: object = {}) {
  const res = await api.delete<APIResponse<T>>(url, config);
  return res.data;
}
export async function GET_PAGINATED<T>(url: string, config: object = {}) {
  const res = await api.get<BasePaginationResponse<T>>(url, config);
  return res.data; // pagination response
}

export interface APIResponse<T> {
  status: boolean;
  message: string;
  data: T;
}
export interface PaginationResponse<T> {
  content: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface BasePaginationResponse<T> {
  status: boolean;
  message: string;
  data: PaginationResponse<T>;
}

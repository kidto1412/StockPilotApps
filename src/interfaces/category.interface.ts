export interface CategoryResponse {
  id: string;
  name: string;
  storeId: string;
  createdAt: string; // atau Date kalau mau diparse
  updatedAt: string; // atau Date
}

export interface CreateCategory {
  name: string;
}

export interface UpdateCategory {
  name: string;
}

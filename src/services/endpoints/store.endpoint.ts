import { LoginResponse } from '@/interfaces/auth.interface';
import { StoreRequest } from '@/interfaces/store';
import { GET, POST } from '@/utils/api.util';

export const StoreEndpoint = {
  create(payload: StoreRequest) {
    return POST<LoginResponse>('/store', payload);
  },
};

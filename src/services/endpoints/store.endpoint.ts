import { StoreRequest } from '@/interfaces/store';
import { GET, POST } from '@/utils/api.util';

export const StoreEndpoint = {
  create(payload: StoreRequest) {
    return POST('/store', payload);
  },
};

import {
  ProvinceResponse,
  RegencyResponse,
} from '@/interfaces/location.interface';
import { GET, POST } from '@/utils/api.util';

export const useLocationEndpoint = {
  province() {
    return GET<ProvinceResponse[]>('/locations/provinces');
  },
  regency(id: string) {
    return GET<RegencyResponse[]>(`/locations/provinces/${id}/regencies`);
  },
};

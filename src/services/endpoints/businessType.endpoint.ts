import { BusinessTypeResponse } from '@/interfaces/businessType.interface';

import { GET } from '@/utils/api.util';

export const useBusinessEndpoint = {
  businessType() {
    return GET<BusinessTypeResponse[]>('/business-type');
  },
};

import { DiscountResponse } from '@/interfaces/discount.interface';
import { create } from 'zustand';

type DiscountState = {
  discount: DiscountResponse | null;

  setDiscount: (discount: DiscountResponse | null) => Promise<void>;
  reset: () => Promise<void>;
};

export const useDiscountStore = create<DiscountState>(set => ({
  discount: null,

  setDiscount: async discount => {
    set({ discount });
  },

  reset: async () => {
    set({ discount: null });
  },
}));

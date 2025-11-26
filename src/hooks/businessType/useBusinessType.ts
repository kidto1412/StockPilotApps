// hooks/useAuth.ts
import { useLoading } from '@/providers/loading.provider';
import { useToastMessage } from '@/providers/toast.provider';
import { useBusinessEndpoint } from '@/services/endpoints/businessType.endpoint';

import { RootStackParamList } from '@/types/navigation.type';
import { getErrorMessage } from '@/utils/global-message.util';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { useRouter } from "expo-router";
import { useState } from 'react';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export function useBusinessType() {
  //   const router = useRouter();

  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToastMessage();

  const getBusinessType = async () => {
    try {
      showLoading();

      const res = await useBusinessEndpoint.businessType();

      return res.data;
    } catch (err) {
      const message = getErrorMessage(err);
      showToast(message, 'error');

      // throw err;
    } finally {
      hideLoading();
    }
  };

  return { getBusinessType };
}

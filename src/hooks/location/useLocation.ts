// hooks/useAuth.ts
import { useLoading } from '@/providers/loading.provider';
import { useToastMessage } from '@/providers/toast.provider';
import { AuthEndpoint } from '@/services/endpoints/auth.endpoint';
import { useLocationEndpoint } from '@/services/endpoints/locations.endpoint';
import { useAuthStore } from '@/stores/auth.store';
import { RootStackParamList } from '@/types/navigation.type';
import { getErrorMessage } from '@/utils/global-message.util';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { useRouter } from "expo-router";
import { useState } from 'react';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export function useLocation() {
  //   const router = useRouter();

  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToastMessage();

  const navigation = useNavigation<RootNavigation>();

  const getProvince = async () => {
    try {
      showLoading();

      const res = await useLocationEndpoint.province();
      // navigation.replace('Main');
      // showToast('Login berhasil 🎉', 'success');
      return res.data;
    } catch (err) {
      const message = getErrorMessage(err);
      showToast(message, 'error');

      // throw err;
    } finally {
      hideLoading();
    }
  };

  const getRegency = async (id: string) => {
    try {
      showLoading();

      const res = await useLocationEndpoint.regency(id);
      // navigation.replace('Main');
      // showToast('Login berhasil 🎉', 'success');
      return res.data;
    } catch (err) {
      const message = getErrorMessage(err);
      showToast(message, 'error');
    } finally {
      hideLoading();
    }
  };

  return { getProvince, getRegency };
}

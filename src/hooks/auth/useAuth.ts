// hooks/useAuth.ts
import { useLoading } from '@/providers/loading.provider';
import { useToastMessage } from '@/providers/toast.provider';
import { AuthEndpoint } from '@/services/endpoints/auth.endpoint';
import { useAuthStore } from '@/stores/auth.store';
import { getErrorMessage } from '@/utils/global-message.util';
// import { useRouter } from "expo-router";
import { useState } from 'react';

export function useAuth() {
  //   const router = useRouter();
  const setAuth = useAuthStore(s => s.setAuth);
  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToastMessage();

  const [data, setData] = useState(null);

  const login = async (username: string, password: string) => {
    try {
      showLoading();

      const res = await AuthEndpoint.login({ username, password });
      console.log(res);

      await setAuth(res.data.access_token);

      //   router.replace("/(main)");
      showToast('Login berhasil 🎉', 'success');
    } catch (err) {
      const message = getErrorMessage(err);
      showToast(message, 'error');

      // throw err;
    } finally {
      hideLoading();
    }
  };

  return { login };
}

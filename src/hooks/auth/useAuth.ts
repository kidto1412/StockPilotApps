// hooks/useAuth.ts
import { RegisterRequest } from '@/interfaces/auth.interface';
import { useLoading } from '@/providers/loading.provider';
import { useToastMessage } from '@/providers/toast.provider';
import { AuthEndpoint } from '@/services/endpoints/auth.endpoint';
import { resetToAuth } from '@/navigations/navigationRef';
import { useAuthStore } from '@/stores/auth.store';
import { useUserState } from '@/stores/user.store';
import { RootStackParamList } from '@/types/navigation.type';
import { getErrorMessage } from '@/utils/global-message.util';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { useRouter } from "expo-router";

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export function useAuth() {
  //   const router = useRouter();
  const setAuth = useAuthStore(s => s.setAuth);
  const setProfile = useUserState(s => s.setProfile);
  const setUserId = useAuthStore(s => s.setUserId);
  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToastMessage();
  const navigation = useNavigation<RootNavigation>();

  const getProfile = async (role?: string) => {
    try {
      let response;

      if (role) {
        response = await AuthEndpoint.profile(role);
      } else {
        // Jika role belum diketahui, coba owner dulu lalu fallback ke staff
        try {
          response = await AuthEndpoint.profile('OWNER');
        } catch {
          response = await AuthEndpoint.profile('STAFF');
        }
      }

      await setProfile(response.data);
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      showToast(message, 'error');
      return null;
    }
  };

  const login = async (username: string, password: string) => {
    try {
      showLoading();

      const res = await AuthEndpoint.login({ username, password });
      console.log(res);

      await setAuth(res.data.token);
      await getProfile();
      navigation.replace('Main');

      // await showToast('Login berhasil 🎉', 'success');
    } catch (err) {
      const message = getErrorMessage(err);
      showToast(message, 'error');

      // throw err;
    } finally {
      hideLoading();
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      showLoading();

      const res = await AuthEndpoint.register(data);
      console.log(res);

      await setAuth(res.data.token);
      await setUserId(res.data.userId);
      await getProfile('OWNER');

      (navigation.replace('Store'),
        showToast('Register berhasil 🎉', 'success'));
    } catch (err) {
      const message = getErrorMessage(err);
      showToast(message, 'error');

      // throw err;
    } finally {
      hideLoading();
    }
  };

  const checkToken = async () => {
    try {
      const res = await AuthEndpoint.checkToken();
      console.log(res.data);
      return res.data;
    } catch (err) {
      const message = getErrorMessage(err);
      showToast(message, 'error');

      // throw err;
    } finally {
    }
  };

  const logout = async () => {
    try {
      showLoading();

      await AuthEndpoint.logout();

      // Clear auth state
      useAuthStore.getState().logout();
      // Clear user state
      useUserState.getState().reset();
      useUserState.getState().resetProfile();

      showToast('Logout berhasil 👋', 'success');
      resetToAuth();
    } catch (err) {
      const message = getErrorMessage(err);
      showToast(message, 'error');
    } finally {
      hideLoading();
    }
  };

  return { login, checkToken, register, logout, getProfile };
}

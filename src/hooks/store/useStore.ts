// hooks/useAuth.ts
import { StoreRequest } from '@/interfaces/store';
import { useLoading } from '@/providers/loading.provider';
import { useToastMessage } from '@/providers/toast.provider';
import { AuthEndpoint } from '@/services/endpoints/auth.endpoint';
import { StoreEndpoint } from '@/services/endpoints/store.endpoint';
import { useAuthStore } from '@/stores/auth.store';
import { RootStackParamList } from '@/types/navigation.type';
import { getErrorMessage } from '@/utils/global-message.util';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { useRouter } from "expo-router";

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export function useStoreEndpoint() {
  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToastMessage();

  const navigation = useNavigation<RootNavigation>();
  const setAuth = useAuthStore(s => s.setAuth);
  const create = async (data: StoreRequest) => {
    try {
      showLoading();
      console.log(data);
      const res = await StoreEndpoint.create(data);
      console.log(res);
      await setAuth(res.data.token);
      navigation.replace('Main');
      showToast('Berhasil 🎉', 'success');
      return res.data;

      //   router.replace("/(main)");
    } catch (err) {
      const message = getErrorMessage(err);
      showToast(message, 'error');
      return err;
    } finally {
      hideLoading();
    }
  };

  return { create };
}

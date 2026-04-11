import { useAuth } from '@/hooks/auth/useAuth';
import { useAuthStore } from '@/stores/auth.store';
import { RootStackParamList } from '@/types/navigation.type';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { Image, View } from 'react-native';

type SplashProps = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: SplashProps) {
  const token = useAuthStore(state => state.token);
  console.log(token);
  const { checkToken, getProfile } = useAuth();
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        navigation.replace('Auth');
        return;
      }

      const valid = await checkToken();

      if (valid) {
        await getProfile();
        navigation.replace('Main'); // langsung ke Main
      } else {
        useAuthStore.getState().logout();
        navigation.replace('Auth');
      }
    };
    verifyToken();
  }, [navigation]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Image
        source={require('@/assets/img/logo.png')}
        className="w-40 h-40 mb-4"
      />
      {/* <Text className="text-lg font-bold text-gray-700">MOBILE POS</Text> */}
    </View>
  );
}

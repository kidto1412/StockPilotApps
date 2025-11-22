import { RootStackParamList } from '@/types/navigation.type';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { Image, View } from 'react-native';

type SplashProps = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: SplashProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Auth'); // ganti ke screen Login
    }, 2000);

    return () => clearTimeout(timer);
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

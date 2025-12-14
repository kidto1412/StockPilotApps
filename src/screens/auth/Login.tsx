import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useAuth } from '@/hooks/auth/useAuth';
import Screen from '@/components/Screen';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useNavigation<any>();

  const { login } = useAuth();

  const onSubmit = async () => {
    console.log('login');
    await login(username, password);
  };

  return (
    <Screen className="justify-center px-6">
      <View className="items-center">
        <Image
          source={require('@/assets/img/logo-transparent.png')}
          className="w-40 h-40 mb-4"
        />
      </View>
      <Text className="text-2xl font-bold mb-6 text-center text-white">
        Login
      </Text>

      <View className="items-end">
        <Text
          className="text-gray-400 font-semibold mb-5"
          onPress={() => router.navigate('LoginStaff')}
        >
          Login sebagai Staff
        </Text>
      </View>
      {/* Username */}
      <View className="mb-4">
        <Input
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
      </View>

      {/* Password */}
      <View className="mb-4">
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          type="password"
        />
      </View>

      {/* Login Button */}
      <Button
        title="Login"
        className="mt-2 primary"
        onPress={onSubmit}
        textClassName="text-white"
      />

      {/* Divider */}
      <View className="my-4">
        <Text className="text-center font-bold text-gray-500">Atau</Text>
      </View>

      {/* Login dengan Google */}
      <Button
        title="Lanjutkan dengan Google"
        className="mt-2 bg-white border-gray-300"
        textClassName="text-black"
        onPress={onSubmit}
      />

      {/* Links */}
      <View className="mt-4 items-center">
        <Text
          className="text-gray-400  font-semibold"
          onPress={() => router.navigate('Register')}
        >
          Buat akun
        </Text>
        <Text className="text-gray-400  font-semibold mt-2">
          Lupa katansadi?
        </Text>
      </View>
    </Screen>
  );
}

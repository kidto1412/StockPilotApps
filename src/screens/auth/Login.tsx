import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useAuth } from '@/hooks/auth/useAuth';
import Screen from '@/components/Screen';
import * as yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

export default function Login() {
  const router = useNavigation<any>();

  const loginSchema = yup.object({
    username: yup
      .string()

      .required('Username wajib diisi'),

    password: yup
      .string()
      .min(6, 'Password minimal 6 karakter')
      .required('Password wajib diisi'),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });
  const { login } = useAuth();
  interface LoginRequest {
    username: string;
    password: string;
  }
  const onSubmit = async (data: LoginRequest) => {
    console.log('login');
    await login(data.username, data.password);
  };

  return (
    <Screen className="justify-center px-6" safeBottom hashMenu={false}>
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
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="Username"
              value={value}
              onChangeText={onChange}
              error={errors.username?.message}
            />
          )}
        />
      </View>

      {/* Password */}
      <View className="mb-4">
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="Password"
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
              type="password"
            />
          )}
        />
      </View>

      {/* Login Button */}
      <Button
        title="Login"
        className="mt-2 primary"
        onPress={handleSubmit(onSubmit)}
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
        onPress={handleSubmit(onSubmit)}
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

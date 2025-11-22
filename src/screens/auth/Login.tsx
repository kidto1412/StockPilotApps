import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useAuth } from '@/hooks/auth/useAuth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useNavigation<any>();

  const { login } = useAuth();

  const onSubmit = async () => {
    await login(username, password);
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-2xl font-bold mb-6 text-center">Login</Text>

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
        color="primary"
        className="mt-2"
        onPress={onSubmit}
      />

      {/* Divider */}
      <View className="my-4">
        <Text className="text-center font-bold text-gray-500">Atau</Text>
      </View>

      {/* Login dengan Google */}
      <Button
        title="Lanjutkan dengan Google"
        color="secondary"
        className="mt-2"
        onPress={onSubmit} // nanti ganti sesuai auth Google
      />

      {/* Links */}
      <View className="mt-4 items-center">
        <Text
          className="text-blue-600 font-semibold"
          onPress={() => router.navigate('Register')}
        >
          Create an account
        </Text>
        <Text className="text-blue-600 font-semibold mt-2">
          Forgot password?
        </Text>
      </View>
    </View>
  );
}

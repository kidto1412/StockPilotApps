import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Input from '@/components/Input';
import Button from '@/components/Button';
import SelectBox from '@/components/SelectBox';
import { useAuth } from '@/hooks/auth/useAuth';
import Screen from '@/components/Screen';

export default function Register() {
  const router = useNavigation<any>();
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'OWNER',
  });

  const { register } = useAuth();

  const onSubmit = async () => {
    console.log('login');
    await register(form);
  };

  return (
    <Screen className="flex-1 justify-center px-6 ">
      <Text className="text-2xl font-bold mb-6 text-center text-white">
        Daftar
      </Text>

      {/* Full Name */}
      <View className="mb-4">
        <Input
          placeholder="Nama Lengkap"
          value={form.fullName}
          onChangeText={text => setForm({ ...form, fullName: text })}
        />
      </View>
      <View className="mb-4">
        <Input
          placeholder="Username"
          value={form.username}
          onChangeText={text => setForm({ ...form, username: text })}
        />
      </View>

      {/* Email */}
      <View className="mb-4">
        <Input
          placeholder="Email"
          keyboardType="email-address"
          value={form.email}
          onChangeText={text => setForm({ ...form, email: text })}
        />
      </View>

      {/* Phone */}
      <View className="mb-4">
        <Input
          placeholder="No Hp"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={text => setForm({ ...form, phone: text })}
        />
      </View>

      {/* Password */}
      <View className="mb-4">
        <Input
          placeholder="Kata Sandi"
          type="password"
          value={form.password}
          onChangeText={text => setForm({ ...form, password: text })}
        />
      </View>

      {/* Confirm Password */}
      {/* <View className="mb-4">
        <Input
          placeholder="Konfirmasi Kata Sandi"
          type="password"
          value={form.confirmPassword}
          onChangeText={text => setForm({ ...form, confirmPassword: text })}
        />
      </View> */}

      {/* Role Select */}
      {/* <View className="mb-4">
        <SelectBox
          options={roles}
          selectedValue={form.role}
          placeholder="Role"
          onValueChange={val => setForm({ ...form, role: val.toString() })}
        />
      </View> */}

      {/* Daftar Button */}
      <Button
        title="Daftar"
        className="mt-2 primary"
        textClassName="text-white"
        onPress={onSubmit}
      />

      {/* Login Link */}
      <View className="mt-4 flex-row items-center justify-center">
        <Text className="text-white">Sudah punya akun?</Text>
        <Text
          className="text-gray-500 ml-2 font-semibold"
          onPress={() => router.navigate('Login')}
        >
          Masuk
        </Text>
      </View>
    </Screen>
  );
}

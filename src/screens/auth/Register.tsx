import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Input from '@/components/input';
import Button from '@/components/button';
import SelectBox from '@/components/SelectBox';

export default function Register() {
  const router = useNavigation<any>();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  const roles = [
    { label: 'UX Research', value: 'ux' },
    { label: 'Web Development', value: 'web' },
    { label: 'Cross Platform Development Process', value: 'cross' },
    { label: 'UI Designing', value: 'ui' },
    { label: 'Backend Development', value: 'backend' },
  ];

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-2xl font-bold mb-6 text-center">Register</Text>

      {/* Full Name */}
      <View className="mb-4">
        <Input
          placeholder="Nama Lengkap"
          value={form.fullName}
          onChangeText={text => setForm({ ...form, fullName: text })}
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
      <View className="mb-4">
        <Input
          placeholder="Konfirmasi Kata Sandi"
          type="password"
          value={form.confirmPassword}
          onChangeText={text => setForm({ ...form, confirmPassword: text })}
        />
      </View>

      {/* Role Select */}
      <View className="mb-4">
        <SelectBox
          options={roles}
          selectedValue={form.role}
          placeholder="Role"
          onValueChange={val => setForm({ ...form, role: val.toString() })}
        />
      </View>

      {/* Daftar Button */}
      <Button
        title="Daftar"
        color="primary"
        className="mt-2"
        onPress={() => router.navigate('Home')}
      />

      {/* Login Link */}
      <View className="mt-4 flex-row items-center justify-center">
        <Text>Sudah punya akun?</Text>
        <Text
          className="text-blue-600 ml-2 font-semibold"
          onPress={() => router.navigate('Login')}
        >
          Masuk
        </Text>
      </View>
    </View>
  );
}

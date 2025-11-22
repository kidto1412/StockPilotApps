import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';
import { useUserState } from '@/stores/user.store';
import { useUser } from '@/hooks/user/useUser';
import { UserRequest } from '@/interfaces/user.interface';
import { useToastMessage } from '@/providers/toast.provider';
import Input from '@/components/Input';
import Button from '@/components/Button';

// Versi sederhana SelectBox
import SelectBox from '@/components/SelectBox';
import { roles } from '@/constants/role.constant';

export default function EmployeeFormPage() {
  const [form, setForm] = useState<UserRequest>({
    fullName: '',
    username: '',
    password: '',
    phone: '',
    role: '',
    email: '',
  });

  const { user } = useUserState();
  const { create, update } = useUser();
  const { showToast } = useToastMessage();

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        password: '', // kosongkan agar user bisa isi baru
        phone: user.phone,
        role: user.role,
      });
    }
  }, [user]);

  const onSubmit = async () => {
    if (!user) {
      // CREATE → semua field wajib termasuk password
      if (
        !form.fullName ||
        !form.username ||
        !form.password ||
        !form.email ||
        !form.role
      ) {
        return showToast('Isi semua inputan!', 'error');
      }
      await create(form);
    } else {
      // EDIT → password boleh kosong
      if (!form.fullName || !form.username || !form.email || !form.role) {
        return showToast('Isi semua inputan kecuali password!', 'error');
      }

      // Jika password kosong, jangan kirim password
      const { password, ...updatePayload } = form;
      await update(user.id, updatePayload);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="p-5">
          <View className="mb-5">
            <Input
              placeholder="Name"
              value={form.fullName}
              onChangeText={text => setForm({ ...form, fullName: text })}
            />
            <Input
              placeholder="Email"
              value={form.email}
              onChangeText={text => setForm({ ...form, email: text })}
            />
            <Input
              placeholder="Username"
              value={form.username}
              onChangeText={text => setForm({ ...form, username: text })}
            />
            {!user && (
              <Input
                placeholder="Password"
                type="password"
                value={form.password}
                onChangeText={text => setForm({ ...form, password: text })}
              />
            )}
            <Input
              placeholder="Phone"
              value={form.phone}
              onChangeText={text => setForm({ ...form, phone: text })}
            />

            <SelectBox
              options={roles.map(r => ({ label: r.label, value: r.value }))}
              selectedValue={form.role}
              placeholder="Pilih Role"
              onValueChange={val => setForm({ ...form, role: val.toString() })}
            />
          </View>

          {/* Buttons */}
          <View className="flex-row justify-start space-x-4">
            <Button
              title="Kembali"
              color="secondary"
              onPress={() => console.log('Kembali')}
            />
            <Button title="Simpan" color="primary" onPress={onSubmit} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

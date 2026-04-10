import { View, Text, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import Input from '@/components/Input';
import { UserRequest } from '@/interfaces/user.interface';
import { useUserState } from '@/stores/user.store';
import { useUser } from '@/hooks/user/useUser';
import { useToastMessage } from '@/providers/toast.provider';
import SelectBox from '@/components/SelectBox';
import { StoreRequest } from '@/interfaces/store';

import { useStoreEndpoint } from '@/hooks/store/useStore';
import { useLocation } from '@/hooks/location/useLocation';
import Button from '@/components/Button';
import { useAuthStore } from '@/stores/auth.store';
import { useBusinessType } from '@/hooks/businessType/useBusinessType';
import Screen from '@/components/Screen';

export default function StorePage() {
  const { userId } = useAuthStore();

  const { getProvince, getRegency } = useLocation();
  const { getBusinessType } = useBusinessType();

  const [form, setForm] = useState<StoreRequest>({
    name: '',
    address: '',
    province: '',
    regency: '',
    ownerId: '',
    logoUrl: null,
    businessTypeId: '',
  });

  const [provinces, setProvinces] = useState<
    { label: string; value: string | number }[]
  >([]);

  const [regencies, setRegencies] = useState<
    { label: string; value: string | number }[]
  >([]);

  const [businessType, setBusinessType] = useState<
    { label: string; value: string | number }[]
  >([]);

  const fetchProvince = async () => {
    const data = await getProvince();

    if (!data) return;
    setProvinces(
      data.map((item: any) => ({
        label: item.name,
        value: item.id,
      })),
    );
  };

  const fetchRegencies = async () => {
    const data = await getRegency(form.province);

    if (!data) return;
    setRegencies(
      data.map((item: any) => ({
        label: item.name,
        value: item.id,
      })),
    );
  };

  const fetchBusinessType = async () => {
    const data = await getBusinessType();

    if (!data) return;
    setBusinessType(
      data.map((item: any) => ({
        label: item.name,
        value: item.id,
      })),
    );
  };

  const { create } = useStoreEndpoint();
  const { showToast } = useToastMessage();

  useEffect(() => {
    if (userId) {
      setForm(prev => ({ ...prev, ownerId: userId }));
    }
  }, [userId]);

  const onSubmit = async () => {
    if (!form.name || !form.address || !form.province || !form.regency) {
      return showToast('Isi semua inputan!', 'error');
    }
    await create(form);
  };
  return (
    <Screen hashMenu={false} className="flex-1 justify-center px-6">
      <Text className="text-2xl font-bold mb-6 text-center mt-5">Toko</Text>
      <ScrollView className="flex-1">
        <View className="p-5">
          <View className="mb-5">
            <Input
              placeholder="Name"
              value={form.name}
              onChangeText={text => setForm({ ...form, name: text })}
            />
            <SelectBox
              placeholder="Provinsi"
              selectedValue={form.province}
              onValueChange={text =>
                setForm({ ...form, province: text.toString() })
              }
              options={provinces}
              onOpen={fetchProvince}
              className="mb-5"
            />
            <SelectBox
              placeholder="Kota"
              selectedValue={form.regency}
              onValueChange={text =>
                setForm({ ...form, regency: text.toString() })
              }
              options={regencies}
              onOpen={fetchRegencies}
              className="mb-5"
            />
            <SelectBox
              placeholder="Tipe Bisnins"
              selectedValue={form.businessTypeId}
              onValueChange={text =>
                setForm({ ...form, businessTypeId: text.toString() })
              }
              options={businessType}
              onOpen={fetchBusinessType}
              className="mb-5"
            />
            <Input
              placeholder="Address"
              value={form.address}
              onChangeText={text => setForm({ ...form, address: text })}
              className="mb-5"
            />
          </View>

          {/* Buttons */}
          <View className="flex-row justify-start space-x-4">
            <Button title="Submit" color="primary" onPress={onSubmit} />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

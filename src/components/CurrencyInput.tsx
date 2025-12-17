// components/CurrencyInput.tsx
import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import Input from './Input';
import { formatRupiah, unformatRupiah } from '@/utils/formatRupiah';

interface CurrencyInputProps {
  label?: string;
  value?: string; // value angka murni: "1000000"
  onChangeValue?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  value = '',
  onChangeValue,
  placeholder = '0',
  className,
}) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value) {
      setDisplayValue(formatRupiah(value));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (text: string) => {
    const rawValue = unformatRupiah(text);
    setDisplayValue(formatRupiah(rawValue));
    onChangeValue?.(rawValue);
  };

  return (
    <Input
      label={label}
      value={displayValue}
      onChangeText={handleChange}
      keyboardType="numeric"
      placeholder={placeholder}
      className={className}
      suffixIcon={<Text className="text-white ml-2">IDR</Text>}
    />
  );
};

export default CurrencyInput;

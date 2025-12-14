// components/Input.tsx
import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  type?: 'text' | 'email' | 'password';
  className?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  className = '',
  ...props
}) => {
  const [isSecure, setIsSecure] = useState(type === 'password');

  return (
    <View className={`mb-4 ${className}`}>
      {label && <Text className="mb-1 text-white font-medium">{label}</Text>}
      <View className="flex-row items-center input-bg rounded-lg px-3  border border-gray-300">
        <TextInput
          className="flex-1 text-white"
          secureTextEntry={isSecure}
          keyboardType={type === 'email' ? 'email-address' : 'default'}
          autoCapitalize={type === 'email' ? 'none' : 'sentences'}
          placeholderTextColor="grey"
          {...props}
        />
        {type === 'password' && (
          <TouchableOpacity onPress={() => setIsSecure(!isSecure)}>
            <Text className="text-white ml-2">
              {isSecure ? 'Show' : 'Hide'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default Input;

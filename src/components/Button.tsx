// components/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  color?: 'primary' | 'secondary' | 'danger';
  textClassName?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  color = 'primary',
  className = '',
  textClassName = 'white',
  ...props
}) => {
  let colorClasses = '';

  switch (color) {
    case 'primary':
      colorClasses = 'bg-blue-500';
      break;
    case 'secondary':
      colorClasses = 'bg-gray-500';
      break;
    case 'danger':
      colorClasses = 'bg-red-500';
      break;
  }

  return (
    <TouchableOpacity
      className={`${colorClasses} px-4 py-2 rounded-lg items-center justify-center ${className}`}
      {...props}
    >
      <Text className={`font-semibold ${textClassName ?? 'white'}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;

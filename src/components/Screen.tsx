import { View } from 'react-native';

export default function Screen({ children, className = '' }: any) {
  return <View className={`flex-1 base ${className}`}>{children}</View>;
}

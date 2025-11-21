// components/ui/Toast.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onHide: () => void;
}

export function Toast({ message, type = 'success', onHide }: ToastProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onHide());
  }, []);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <Animated.View
      style={{ transform: [{ translateY: slideAnim }] }}
      className={`absolute left-5 right-5 px-4 py-3 rounded-xl shadow-lg ${bgColor} z-50`}
    >
      <Text className="text-white font-medium">{message}</Text>
    </Animated.View>
  );
}

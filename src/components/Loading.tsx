// components/LoadingOverlay.tsx
import { ActivityIndicator, View } from "react-native";

export function Loading() {
  return (
    <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 items-center justify-center z-50">
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}

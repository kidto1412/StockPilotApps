import { useAuthStore } from "@/stores/auth.store";
import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import AppStack from "./stacks/AppStack";
import AuthStack from "./stacks/AuthStack";

export default function RootNavigator() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);

  // Untuk memastikan SecureStore selesai load
  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

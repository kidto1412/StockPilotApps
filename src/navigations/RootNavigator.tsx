import Login from '@/screens/auth/Login';
import Register from '@/screens/auth/Register';

import Main from '@/screens/main/Main';
import SplashScreen from '@/screens/Splash';
import { RootStackParamList } from '@/types/navigation.type';
// import { createStackNavigator } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import MainNavigator from './MainNavigator';
import StorePage from '@/screens/store/Store';
import MyDrawer from './Drawer';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // mematikan header untuk semua screen
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Auth" component={AuthNavigator} />

      {/* <Stack.Screen name="Main" component={MainNavigator} /> */}
      <Stack.Screen name="Main" component={MainNavigator} />

      <Stack.Screen name="Store" component={StorePage} />
    </Stack.Navigator>
  );
}

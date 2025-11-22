import Login from '@/screens/auth/Login';
import Register from '@/screens/auth/Register';
import HomePage from '@/screens/main/Home';
import SplashScreen from '@/screens/Splash';
import { RootStackParamList } from '@/types/root.type';
// import { createStackNavigator } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // mematikan header untuk semua screen
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Home" component={HomePage} />
    </Stack.Navigator>
  );
}

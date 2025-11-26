import ChangePass from '@/screens/auth/ChangePass';
import Login from '@/screens/auth/Login';
import LoginStaff from '@/screens/auth/LoginStaff';
import Register from '@/screens/auth/Register';
import StorePage from '@/screens/store/Store';
import { AuthStackParamList } from '@/types/navigation.type';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<AuthStackParamList>();
export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="LoginStaff" component={LoginStaff} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ChangePassword" component={ChangePass} />
    </Stack.Navigator>
  );
}

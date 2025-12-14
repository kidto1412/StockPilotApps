import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
  Store: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  LoginStaff: undefined;
  Register: undefined;
  ChangePassword: undefined;
  // Store: undefined;
};

export type BottomTabStackParamList = {
  Home: undefined;
  Setting: undefined;
  History: undefined;
  Report: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  Home: undefined;
  Product: undefined;
  FormProduct: undefined;
  Employe: undefined;
  Customer: undefined;
  Report: undefined;
  Category: undefined;
  Store: undefined;
  FormEmployee: undefined;
  FormCategory: undefined;
  Sales: undefined;
  Discount: undefined;
};

export type NavigationMainType = NativeStackScreenProps<MainStackParamList>;

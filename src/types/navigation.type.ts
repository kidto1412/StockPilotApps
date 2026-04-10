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
  Product: { source?: 'product' | 'stock' | 'purchase' } | undefined;
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
  FormDiscount: undefined;
  Checkout: { mode?: 'purchase' | 'sales' } | undefined;
  Drawer: undefined;
  Supplier: undefined;
  SupplierForm: undefined;
};

export type NavigationMainType = NativeStackScreenProps<MainStackParamList>;

export type DrawerParamList = {
  Home: undefined;
  Product: { source?: 'product' | 'stock' | 'purchase' } | undefined;
  FormProduct: undefined;
  Category: undefined;
  FormCategory: undefined;
  Employe: undefined;
  FormEmployee: undefined;
  Customer: undefined;
  Sales: undefined;
  Discount: undefined;
  FormDiscount: undefined;
  Checkout: { mode?: 'purchase' | 'sales' } | undefined;
  Tabs: undefined;
  Pembelian: { source?: 'product' | 'stock' | 'purchase' } | undefined;
  Supplier: undefined;
  Stock: { source?: 'product' | 'stock' | 'purchase' } | undefined;
};

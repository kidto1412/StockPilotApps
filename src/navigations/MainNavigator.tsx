import CustomerPage from '@/screens/customer/Customer';
import EmployeePage from '@/screens/employee/Employee';
import Product from '@/screens/product/Product';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabsNavigator from './BottomTabNavigator';
import HomePage from '@/screens/main/Home';
import ProductFormPage from '@/screens/product/Form';
import EmployeeFormPage from '@/screens/employee/Form';
import { MainStackParamList } from '@/types/navigation.type';
import CategoryPage from '@/screens/category/Category';
import CategoryForm from '@/screens/category/Form';
import SalesPage from '@/screens/sales/Sales';
import SalesReportPage from '@/screens/report/SalesReport';
import DisscountPage from '@/screens/disccount/Disscount';
import CheckoutScreen from '@/screens/sales/Checkout';
import FormDisscount from '@/screens/disccount/Form';
import MyDrawer from './Drawer';
import SupplierForm from '@/screens/supplier/SupplierForm';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        animation: 'slide_from_right',
        headerStyle: {
          backgroundColor: '#0f1a14', // warna dark
        },
        headerTintColor: '#ffffff',
      }}
    >
      <Stack.Screen
        name="Drawer"
        component={MyDrawer}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Tabs" component={BottomTabsNavigator} />

      {/* screen lain yang akan dipanggil dari Home menu */}
      <Stack.Screen name="Home" component={HomePage} />
      <Stack.Screen name="Product" component={Product} />
      <Stack.Screen name="FormProduct" component={ProductFormPage} />
      <Stack.Screen name="Category" component={CategoryPage} />
      <Stack.Screen name="FormCategory" component={CategoryForm} />
      <Stack.Screen name="Employe" component={EmployeePage} />
      <Stack.Screen name="FormEmployee" component={EmployeeFormPage} />
      <Stack.Screen name="Customer" component={CustomerPage} />
      <Stack.Screen name="Sales" component={SalesPage} />
      <Stack.Screen name="SalesReport" component={SalesReportPage} />
      <Stack.Screen name="Discount" component={DisscountPage} />
      <Stack.Screen name="FormDiscount" component={FormDisscount} />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="SupplierForm" component={SupplierForm} />
    </Stack.Navigator>
  );
}

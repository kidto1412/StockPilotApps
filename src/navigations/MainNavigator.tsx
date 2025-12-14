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
import DisscountPage from '@/screens/disccount/Disscount';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="Tabs"
        component={BottomTabsNavigator}
        options={{ headerShown: false }}
      />

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
      <Stack.Screen name="Discount" component={DisscountPage} />
    </Stack.Navigator>
  );
}

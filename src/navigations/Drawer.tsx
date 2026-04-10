import CategoryPage from '@/screens/category/Category';
import CategoryForm from '@/screens/category/Form';
import CustomerPage from '@/screens/customer/Customer';
import EmployeePage from '@/screens/employee/Employee';
import EmployeeFormPage from '@/screens/employee/Form';
import ProductFormPage from '@/screens/product/Form';
import Product from '@/screens/product/Product';
import SalesPage from '@/screens/sales/Sales';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import DisscountPage from '@/screens/disccount/Disscount';
import FormDisscount from '@/screens/disccount/Form';
import CheckoutScreen from '@/screens/sales/Checkout';
import { DrawerParamList } from '@/types/navigation.type';
import {
  CreditCard,
  HomeIcon,
  Landmark,
  Package,
  Percent,
  ShoppingCart,
  SquareUserRound,
  Tag,
  UserCog,
  Users,
} from 'lucide-react-native';
import BottomTabsNavigator from './BottomTabNavigator';
import DrawerHeaderLeft from '@/components/DrawerHeaderLeft';
import SupplierPage from '@/screens/supplier/Supplier';

const Drawer = createDrawerNavigator<DrawerParamList>();
const drawerIcons = {
  Home: HomeIcon,
  Product: Package,
  FormProduct: Package,
  Category: Tag,
  FormCategory: Tag,
  Employe: Users,
  FormEmployee: UserCog,
  Customer: Users,
  Sales: ShoppingCart,
  Discount: Percent,
  FormDiscount: Percent,
  Checkout: CreditCard,
  Pembelian: Landmark,
  Supplier: SquareUserRound,
  Stock: Package,
};

const drawerMenuRoutes: Array<keyof DrawerParamList> = [
  'Home',
  'Product',
  'Category',
  'Employe',
  'Customer',
  'Sales',
  'Discount',
  'Checkout',
  'Pembelian',
  'Supplier',
  'Stock',
];

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { state, navigation } = props;
  const currentRouteName = state.routes[state.index]?.name;

  const homeRoute = state.routes.find(route => route.name === 'Home') as
    | (typeof state.routes)[number]
    | undefined;
  const nestedState = (homeRoute?.state as any) || undefined;
  const activeTabName = nestedState?.routes?.[nestedState.index ?? 0]?.name;

  return (
    <DrawerContentScrollView {...props}>
      {drawerMenuRoutes.map(routeName => {
        const Icon = drawerIcons[routeName as keyof typeof drawerIcons];
        const isHomeFocused =
          currentRouteName === 'Home' && (activeTabName ?? 'Home') === 'Home';
        const focused =
          routeName === 'Home' ? isHomeFocused : currentRouteName === routeName;

        return (
          <DrawerItem
            key={routeName}
            label={routeName}
            focused={focused}
            activeTintColor="green"
            inactiveTintColor="grey"
            icon={({ color, size }) =>
              Icon ? <Icon color={color} size={size} strokeWidth={2} /> : null
            }
            onPress={() => {
              if (routeName === 'Home') {
                (navigation as any).navigate('Home', {
                  screen: 'Home',
                });
                navigation.closeDrawer();
                return;
              }
              if (routeName === 'Product') {
                navigation.navigate('Product', { source: 'product' });
                return;
              }
              if (routeName === 'Stock') {
                navigation.navigate('Stock', { source: 'stock' });
                return;
              }
              if (routeName === 'Pembelian') {
                navigation.navigate('Pembelian', { source: 'purchase' });
                return;
              }
              navigation.navigate(routeName as never);
            }}
          />
        );
      })}
    </DrawerContentScrollView>
  );
}

export default function MyDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={({ route }) => ({
        headerLeft: () => <DrawerHeaderLeft />,
        headerStyle: { backgroundColor: '#111' },
        headerTintColor: '#fff',
        headerShown: false,
        drawerActiveTintColor: 'green',
      })}
    >
      <Drawer.Screen
        name="Tabs"
        component={BottomTabsNavigator}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen name="Home" component={BottomTabsNavigator} />
      <Drawer.Screen
        name="Product"
        component={Product}
        initialParams={{ source: 'product' }}
      />

      <Drawer.Screen name="Category" component={CategoryPage} />

      <Drawer.Screen name="Employe" component={EmployeePage} />

      <Drawer.Screen name="Customer" component={CustomerPage} />
      <Drawer.Screen name="Sales" component={SalesPage} />
      <Drawer.Screen name="Discount" component={DisscountPage} />

      <Drawer.Screen
        name="Checkout"
        component={CheckoutScreen}
        initialParams={{ mode: 'sales' }}
        options={{ swipeEnabled: false }}
      />

      <Drawer.Screen
        name="Pembelian"
        component={Product}
        initialParams={{ source: 'purchase' }}
      />
      <Drawer.Screen name="Supplier" component={SupplierPage} />
      <Drawer.Screen
        name="Stock"
        component={Product}
        initialParams={{ source: 'stock' }}
      />
    </Drawer.Navigator>
  );
}

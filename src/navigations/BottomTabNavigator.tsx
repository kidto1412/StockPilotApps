import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '@/screens/main/Home';
import History from '@/screens/history/History';
import Report from '@/screens/report/Report';
import SettingPage from '@/screens/main/Setting';
import BottomNavigation from '@/components/BottomNav';

const Tab = createBottomTabNavigator();

export default function BottomTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, animation: 'shift' }}
      tabBar={props => <BottomNavigation {...props} />}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="History" component={History} />
      <Tab.Screen name="Report" component={Report} />
      <Tab.Screen name="Settings" component={SettingPage} />
    </Tab.Navigator>
  );
}

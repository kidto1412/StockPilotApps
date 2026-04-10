import {
  createDrawerNavigator,
  DrawerNavigationProp,
} from '@react-navigation/drawer';
import { TouchableOpacity } from 'react-native';
import { Menu as MenuIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerParamList } from '@/types/navigation.type';

const Drawer = createDrawerNavigator();

export default function DrawerHeaderLeft() {
  type HomeNavProp = DrawerNavigationProp<DrawerParamList, 'Home'>;
  const navigation = useNavigation<HomeNavProp>();

  return (
    <TouchableOpacity
      style={{ marginLeft: 16 }}
      onPress={() => navigation.toggleDrawer()}
    >
      <MenuIcon size={24} color="#fff" />
    </TouchableOpacity>
  );
}

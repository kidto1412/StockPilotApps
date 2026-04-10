import { DrawerParamList } from '@/types/navigation.type';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { MenuIcon } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps {
  children: React.ReactNode;
  className?: string;
  safeBottom?: boolean;
  hashMenu?: boolean;
}

export default function Screen({
  children,
  className = '',
  safeBottom = false,
  hashMenu = true,
}: ScreenProps) {
  const navigation = useNavigation<any>();

  const onMenuPress = () => {
    if (typeof navigation?.toggleDrawer === 'function') {
      navigation.toggleDrawer();
      return;
    }

    const parent = navigation?.getParent?.();
    if (parent && typeof parent.toggleDrawer === 'function') {
      parent.toggleDrawer();
    }
  };

  return (
    <SafeAreaView
      edges={safeBottom ? ['top', 'bottom'] : ['top']}
      className={`flex-1 base ${className}`}
    >
      <View className="ml-3 my-5">
        <TouchableOpacity onPress={onMenuPress}>
          {hashMenu ? <MenuIcon size={28} color="#fff" /> : <></>}
        </TouchableOpacity>
      </View>
      {children}
    </SafeAreaView>
  );
}

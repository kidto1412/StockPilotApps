import { StyleSheet, View } from 'react-native';

import FilterScroll from '@/components/FilterScroll';
import Input from '@/components/Input';
import VerticalProduct from '@/components/VerticalProduct';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabTwoScreen() {
  return (
    <SafeAreaView>
      <View>
        <Input placeholder="Name" className="bg-white rounded-lg mb-5" />
        <FilterScroll />
        <VerticalProduct />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});

import Input from '@/components/input';
import ListUserCard from '@/components/ListUser';
import { useNavigation } from '@react-navigation/native';
// import { useRouter } from "expo-router";
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CustomerPage() {
  // const router = useNavigation<AppNavigation>();
  return (
    <SafeAreaView>
      <View>
        <Input placeholder="Name" className="bg-white rounded-lg mb-5" />
        {/* <ListUserCard /> */}
      </View>
    </SafeAreaView>
  );
}

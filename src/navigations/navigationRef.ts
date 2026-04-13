import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '@/types/navigation.type';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function resetToAuth() {
  if (!navigationRef.isReady()) {
    return false;
  }

  navigationRef.reset({
    index: 0,
    routes: [{ name: 'Auth' }],
  });

  return true;
}

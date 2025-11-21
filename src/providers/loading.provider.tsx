// providers/LoadingProvider.tsx
// import { Loading } from "@/components/ui/Loading";
import { Loading } from '@/components/Loading';
import { createContext, useContext, useState } from 'react';

interface LoadingContextType {
  showLoading: () => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
  showLoading: () => {},
  hideLoading: () => {},
});

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  const showLoading = () => setVisible(true);
  const hideLoading = () => setVisible(false);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      {visible && <Loading />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}

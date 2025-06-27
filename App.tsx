import { NavigationContainer } from '@react-navigation/native';
import PaymentNavigator from './src/navigators/PaymentNavigator';
import MainNavigator from './src/navigators/MainNavigator';
import AuthNavigator from './src/navigators/AuthNavigator';
import './global.css';
import { StatusBar } from 'react-native';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { NativeModules } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

const { KioskModule } = NativeModules;

function AppInner() {
  const { isLoggedIn, goToPayment, userType } = useAuth();

  // useEffect(() => {
  //   if (KioskModule?.startKioskService) {
  //     KioskModule.startKioskService();
  //   } else {
  //     console.warn('KioskModule or startKioskService not available');
  //   }
  // }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        {!isLoggedIn ? (
          <AuthNavigator />
        ) : goToPayment ? (
          <PaymentNavigator />
        ) : (
          <MainNavigator />
        )}
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </QueryClientProvider>
  );
}
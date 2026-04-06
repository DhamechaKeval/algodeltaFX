import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme/colors';
import { AlertProvider } from './src/components/common/AlertContext';
import { LoadingLockProvider } from './src/context/LoadingLockContext';
import GlobalLoadingOverlay from './src/components/common/GlobalLoadingOverlay';

export default function App() {
  return (
    <SafeAreaProvider style={{ backgroundColor: colors.bg }}>
      <AlertProvider>
        <LoadingLockProvider>
          <StatusBar
            barStyle="light-content"
            backgroundColor={colors.bg}
            translucent={false}
          />
          <AppNavigator />
          <GlobalLoadingOverlay />
        </LoadingLockProvider>
      </AlertProvider>
    </SafeAreaProvider>
  );
}

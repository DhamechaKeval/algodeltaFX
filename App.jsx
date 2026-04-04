import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme/colors';
import { AlertProvider } from './src/components/common/AlertContext';

export default function App() {
  return (
    <SafeAreaProvider style={{ backgroundColor: colors.bg }}>
      <AlertProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.bg}
          translucent={false}
        />
        <AppNavigator />
      </AlertProvider>
    </SafeAreaProvider>
  );
}

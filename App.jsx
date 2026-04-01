import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme/colors';

export default function App() {
  return (
    <SafeAreaProvider style={{ backgroundColor: colors.bg }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.bg}
        translucent={false}
      />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

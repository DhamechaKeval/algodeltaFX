import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

import AccountsScreen from '../screens/accounts/AccountsScreen';
import CopyTradingScreen from '../screens/copytrading/CopyTradingScreen';
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Accounts: { icon: '🏠', label: 'Accounts' },
  CopyTrading: { icon: '📊', label: 'Copy Trade' },
  Orders: { icon: '📋', label: 'Orders' },
  Wallet: { icon: '💰', label: 'Wallet' },
  Profile: { icon: '👤', label: 'Profile' },
};

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const { icon, label } = TAB_ICONS[route.name];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.7}
          >
            {isFocused && <View style={styles.activeBar} />}
            <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>
              {icon}
            </Text>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Accounts" component={AccountsScreen} />
      <Tab.Screen name="CopyTrading" component={CopyTradingScreen} />
      <Tab.Screen name="Orders" component={OrderHistoryScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0d1526',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: spacing.sm,
    paddingTop: spacing.xs,
    height: 62,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: spacing.xs,
  },
  activeBar: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 2.5,
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.full,
  },
  tabIcon: { fontSize: spacing.icon.sm, marginBottom: 2 },
  tabIconActive: {},
  tabLabel: {
    fontSize: typography.xs,
    color: colors.textMuted,
    fontWeight: typography.medium,
  },
  tabLabelActive: { color: colors.primary, fontWeight: typography.bold },
});

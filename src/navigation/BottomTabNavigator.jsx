import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '../components/common/Icon';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

import AccountsScreen from '../screens/accounts/AccountsScreen';
import CopyTradingScreen from '../screens/copytrading/CopyTradingScreen';
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Accounts', label: 'Accounts', icon: 'home' },
  { name: 'CopyTrading', label: 'Copy Trade', icon: 'copy-trade' },
  { name: 'Orders', label: 'Orders', icon: 'orders' },
  { name: 'Wallet', label: 'Wallet', icon: 'wallet' },
  { name: 'Profile', label: 'Profile', icon: 'profile' },
];

function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        s.bar,
        {
          paddingBottom: Math.max(insets.bottom, spacing.sm),
          height: 54 + Math.max(insets.bottom, spacing.sm),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const tab = TABS[index];
        const focused = state.index === index;
        const iconColor = focused ? colors.primary : colors.textMuted;
        const labelColor = focused ? colors.primary : colors.textMuted;

        return (
          <TouchableOpacity
            key={route.key}
            style={s.tab}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(route.name)}
          >
            {focused && <View style={s.activeBar} />}
            <Icon
              name={tab.icon}
              size={22}
              color={iconColor}
              strokeWidth={focused ? 2 : 1.6}
            />
            <Text style={[s.label, { color: labelColor }]}>{tab.label}</Text>
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

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#0d1526',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
  },
  tab: {
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
  label: {
    fontSize: typography.xs,
    fontWeight: typography.medium,
    marginTop: 2,
  },
});

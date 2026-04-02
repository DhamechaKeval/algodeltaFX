import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function TabBar({ tabs, activeTab, onTabChange }) {
  return (
    <View style={s.tabBar}>
      {tabs.map((t, i) => (
        <TouchableOpacity
          key={t}
          style={[s.tabBtn, activeTab === i && s.tabActive]}
          onPress={() => onTabChange(i)}
        >
          <Text
            style={[s.tabTxt, activeTab === i && s.tabTxtActive]}
            numberOfLines={1}
          >
            {t}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.base,
    marginVertical: spacing.sm + 2,
    backgroundColor: colors.bgCard,
    borderRadius: spacing.radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    borderRadius: spacing.radius.sm,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.primary },
  tabTxt: {
    fontSize: typography.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTxtActive: { color: colors.primaryText, fontWeight: '700' },
});

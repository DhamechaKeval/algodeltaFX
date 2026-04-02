import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from '../../../../components/common/Icon';
import { colors } from '../../../../theme/colors';
import { typography } from '../../../../theme/typography';
import { spacing } from '../../../../theme/spacing';

export default function OrderEmptyState({ loading, message }) {
  return (
    <View style={s.center}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <>
          <Icon
            name="orders"
            size={40}
            color={colors.textMuted}
            strokeWidth={1}
          />
          <Text style={s.txt}>{message || 'No data found.'}</Text>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl * 2,
  },
  txt: {
    color: colors.textSecondary,
    marginTop: spacing.md,
    fontSize: typography.md,
  },
});

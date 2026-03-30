import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

/**
 * AppHeader
 * Props:
 *   right  — any React node rendered on the right side (buttons, avatar etc.)
 */
export default function AppHeader({ right }) {
  return (
    <View style={styles.header}>
      <Image
        source={require('../../assets/algodeltafx_com_horizontal_logo.jpg')}
        style={styles.logo}
        resizeMode="contain"
      />
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  logo: {
    width: 130,
    height: 36,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});

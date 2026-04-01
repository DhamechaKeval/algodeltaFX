import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export default function AppHeader({ right }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
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
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm - 2,
    backgroundColor: colors.bg,
  },
  logo: { width: 130, height: 36 },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});

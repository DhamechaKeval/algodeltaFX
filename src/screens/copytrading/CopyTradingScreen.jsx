import React from 'react';
import { View, Text, StyleSheet, StatusBar, Image } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import AppHeader from '../../components/common/AppHeader';

export default function CopyTradingScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <AppHeader />

      <View style={styles.titleRow}>
        <Text style={styles.pageTitle}>Copy Trading</Text>
      </View>
      <View style={styles.center}>
        <Text style={styles.icon}>📊</Text>
        <Text style={styles.comingText}>Copy Trading</Text>
        <Text style={styles.comingSubText}>Coming soon...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  logo: { width: 130, height: 36 },
  titleRow: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  pageTitle: {
    fontSize: typography.xl,
    fontWeight: typography.extrabold,
    color: colors.textPrimary,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 48, marginBottom: spacing.base },
  comingText: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  comingSubText: { fontSize: typography.sm, color: colors.textSecondary },
});

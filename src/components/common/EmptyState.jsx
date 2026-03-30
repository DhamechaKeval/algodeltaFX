import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import Button from './Button';

/**
 * EmptyState
 * Props:
 *   type      — 'loading' | 'error' | 'empty'
 *   title     — main message
 *   subtitle  — secondary message
 *   onRetry   — callback for error retry button
 *   icon      — emoji icon for empty state
 */
export default function EmptyState({
  type = 'empty',
  title,
  subtitle,
  onRetry,
  icon = '📭',
}) {
  if (type === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{title || 'Loading...'}</Text>
      </View>
    );
  }

  if (type === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>{title || 'Something went wrong'}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {onRetry && (
          <Button label="Retry" onPress={onRetry} style={styles.retryBtn} />
        )}
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title || 'Nothing here yet'}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  errorTitle: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  icon: {
    fontSize: 44,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: spacing.base,
    paddingHorizontal: spacing.xl,
  },
});

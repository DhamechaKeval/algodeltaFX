import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

/**
 * Button
 * Props:
 *   label     — button text
 *   onPress   — handler
 *   variant   — 'primary' | 'outline' | 'danger' | 'ghost'  (default: primary)
 *   size      — 'sm' | 'md' | 'lg'                          (default: md)
 *   loading   — shows spinner
 *   disabled  — disables button
 *   style     — extra container style override
 */
export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
}) {
  const containerStyle = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.label,
    styles[`label_${size}`],
    styles[`labelColor_${variant}`],
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.primaryText : colors.primary}
          size="small"
        />
      ) : (
        <Text style={textStyle}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.radius.md,
  },
  disabled: { opacity: 0.65 },

  // Sizes
  size_sm: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  size_md: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md - 2 },
  size_lg: { paddingHorizontal: spacing.xxl, paddingVertical: spacing.md },

  // Variants
  variant_primary: { backgroundColor: colors.primary },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  variant_danger: { backgroundColor: colors.error },
  variant_ghost: { backgroundColor: 'transparent' },

  // Label base
  label: { fontWeight: typography.bold },

  // Label sizes
  label_sm: { fontSize: typography.xs + 1 },
  label_md: { fontSize: typography.md },
  label_lg: { fontSize: typography.base },

  // Label colors per variant
  labelColor_primary: { color: colors.primaryText },
  labelColor_outline: { color: colors.textPrimary },
  labelColor_danger: { color: '#fff' },
  labelColor_ghost: { color: colors.primary },
});

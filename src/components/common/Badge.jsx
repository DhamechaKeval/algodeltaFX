import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

/**
 * Badge
 * Props:
 *   label    — text inside badge
 *   variant  — 'green' | 'gray' | 'red' | 'orange'  (default: green)
 */
export default function Badge({ label, variant = 'green' }) {
  return (
    <View style={[styles.base, styles[`bg_${variant}`]]}>
      <Text style={[styles.text, styles[`txt_${variant}`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: spacing.radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  text: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
  },

  // Green
  bg_green: {
    backgroundColor: 'rgba(74,222,128,0.12)',
    borderColor: 'rgba(74,222,128,0.25)',
  },
  txt_green: { color: colors.primary },

  // Gray
  bg_gray: { backgroundColor: colors.bgInput, borderColor: colors.border },
  txt_gray: { color: colors.textSecondary },

  // Red
  bg_red: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderColor: 'rgba(239,68,68,0.3)',
  },
  txt_red: { color: colors.error },

  // Orange
  bg_orange: {
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderColor: 'rgba(245,158,11,0.3)',
  },
  txt_orange: { color: colors.warning },
});

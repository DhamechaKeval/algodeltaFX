import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors}     from '../../theme/colors';
import {typography} from '../../theme/typography';
import {spacing}    from '../../theme/spacing';

/**
 * StatBox
 * Props:
 *   label    — top label text
 *   value    — main value
 *   green    — highlight value in green
 *   red      — highlight value in red
 *   flex     — flex value for sizing (default 1)
 */
export default function StatBox({label, value, green = false, red = false, flex = 1}) {
  const valueColor = green
    ? colors.primary
    : red
    ? colors.error
    : colors.textPrimary;

  return (
    <View style={[styles.box, {flex}]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, {color: valueColor}]}>{value ?? '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.bgInput,
    borderRadius: spacing.radius.sm,
    padding: spacing.xs + 2,
    alignItems: 'center',
  },
  label: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  value: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
});
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

/**
 * Toggle
 * Props:
 *   value     — boolean
 *   onChange  — callback(newValue)
 *   disabled  — optional
 */
export default function Toggle({ value, onChange, disabled = false }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={() => onChange && onChange(!value)}
    >
      <View style={[styles.track, value ? styles.trackOn : styles.trackOff]}>
        <View
          style={[styles.thumb, value ? styles.thumbOn : styles.thumbOff]}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 30,
    height: 16,
    borderRadius: spacing.radius.full,
    position: 'relative',
  },
  trackOn: { backgroundColor: colors.primary },
  trackOff: { backgroundColor: colors.borderLight },

  thumb: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: spacing.radius.full,
    backgroundColor: '#fff',
    top: 2,
  },
  thumbOn: { right: 2 },
  thumbOff: { left: 2 },
});

import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Icon from './Icon';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

/**
 * SearchBar
 * Props:
 *   value, onChangeText, placeholder
 *   style       — overrides outer wrapper style
 *   hideIcon    — if true, don't show the search icon (used when parent wraps it)
 */
export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  style,
  hideIcon = false,
}) {
  return (
    <View style={[s.wrap, style]}>
      {!hideIcon && (
        <Icon
          name="search"
          size={14}
          color={colors.textMuted}
          strokeWidth={1.8}
        />
      )}
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textPlaceholder}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: typography.sm,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
  },
});

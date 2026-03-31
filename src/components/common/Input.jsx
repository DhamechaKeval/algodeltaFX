import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from './Icon';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function Input({
  label,
  password = false,
  error,
  style,
  ...rest
}) {
  const [secure, setSecure] = useState(password);

  return (
    <View style={[s.wrap, style]}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <View style={[s.inputWrap, error && s.inputError]}>
        <TextInput
          style={s.input}
          placeholderTextColor={colors.textPlaceholder}
          secureTextEntry={secure}
          autoCapitalize="none"
          autoCorrect={false}
          {...rest}
        />
        {password && (
          <TouchableOpacity style={s.eye} onPress={() => setSecure(v => !v)}>
            <Icon
              name={secure ? 'eye-off' : 'eye'}
              size={18}
              color={colors.textMuted}
              strokeWidth={1.8}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.semibold,
    marginBottom: spacing.xs,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.bgInputBorder,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.md,
  },
  inputError: { borderColor: colors.error },
  input: {
    flex: 1,
    fontSize: typography.md,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  eye: { padding: spacing.xs },
  error: {
    fontSize: typography.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

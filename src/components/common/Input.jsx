import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

/**
 * Input
 * Props:
 *   label       — field label above input
 *   password    — if true shows eye toggle
 *   error       — error message shown below
 *   style       — extra wrapper style
 *   ...rest     — all standard TextInput props
 */
export default function Input({
  label,
  password = false,
  error,
  style,
  ...rest
}) {
  const [secure, setSecure] = useState(password);

  return (
    <View style={[styles.wrap, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrap, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textPlaceholder}
          secureTextEntry={secure}
          autoCapitalize="none"
          autoCorrect={false}
          {...rest}
        />
        {password && (
          <TouchableOpacity
            style={styles.eye}
            onPress={() => setSecure(v => !v)}
          >
            <Text style={styles.eyeIcon}>{secure ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
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
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    fontSize: typography.md,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  eye: {
    padding: spacing.xs,
  },
  eyeIcon: {
    fontSize: 16,
  },
  error: {
    fontSize: typography.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

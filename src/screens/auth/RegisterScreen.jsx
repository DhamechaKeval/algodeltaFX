import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const handleSignUp = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }
    if (!agreed) {
      Alert.alert('Error', 'Please agree to the Terms and Conditions.');
      return;
    }
    Alert.alert('Sign Up', 'Registration submitted! Please check your email.');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoWrap}>
          <Image
            source={require('../../assets/algodeltafx_com_horizontal_logo.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View>
          <Text style={styles.title}>SIGN UP</Text>
          <Text style={styles.subtitle}>Join AlgodeltaFX Today</Text>
          <Text style={styles.subtitleSub}>
            Create your account to get started.
          </Text>

          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={[
              styles.input,
              focusedInput === 'email' && styles.inputFocused,
            ]}
            placeholder="Enter email"
            placeholderTextColor={colors.textPlaceholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            onBlur={() => setFocusedInput(null)}
            onFocus={() => setFocusedInput('email')}
          />

          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAgreed(v => !v)}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
              {agreed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              I hereby confirm that I have read and agree to the{' '}
              <Text style={styles.termsLink}>Terms and Conditions.</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={handleSignUp}>
            <Text style={styles.btnText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign in instead</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  logoWrap: { alignItems: 'center', marginBottom: spacing.xxl },
  logo: { width: 200, height: 60 },
  title: {
    fontSize: typography.xxl,
    fontWeight: typography.extrabold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitleSub: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.semibold,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.bgInputBorder,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: typography.md,
    color: colors.textPrimary,
    marginBottom: spacing.base,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3, // Android
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: spacing.radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    fontSize: typography.xs,
    color: colors.primaryText,
    fontWeight: typography.bold,
  },
  termsText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  termsLink: { color: colors.primary, fontWeight: typography.semibold },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.md,
    paddingVertical: spacing.base - 1,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  btnText: {
    fontSize: typography.base,
    fontWeight: typography.extrabold,
    color: colors.primaryText,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  footerText: { fontSize: typography.sm + 1, color: colors.textSecondary },
  footerLink: {
    fontSize: typography.sm + 1,
    color: colors.primary,
    fontWeight: typography.bold,
  },
});

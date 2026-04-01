import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import Icon from '../../components/common/Icon';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { handleLogin } = useAuth();
  const [focusedInput, setFocusedInput] = useState(null);

  const onPressLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password.');
      return;
    }
    setLoading(true);
    const result = await handleLogin(email, password);
    setLoading(false);
    if (result.success) {
      navigation.replace('Main');
    } else {
      Alert.alert('Login Failed', result.message);
    }
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
        {/* Logo Image */}
        <View style={styles.logoWrap}>
          <Image
            source={require('../../assets/algodeltafx_com_horizontal_logo.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Card */}
        <View>
          <Text style={styles.title}>SIGN IN</Text>
          <Text style={styles.subtitle}>Welcome Back</Text>
          <Text style={styles.subtitleSub}>
            Sign in to access your account.
          </Text>

          {/* Email */}
          <Text style={styles.label}>Email</Text>
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
            onFocus={() => setFocusedInput('email')}
            onBlur={() => setFocusedInput(null)}
          />

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'password' && styles.inputFocused,
              ]}
              placeholder="Enter Password"
              placeholderTextColor={colors.textPlaceholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
            />

            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword(v => !v)}
            >
              <Icon
                name={showPassword ? 'eye-off' : 'eye'}
                size={18}
                color={colors.textMuted}
                strokeWidth={1.8}
              />
            </TouchableOpacity>
          </View>

          {/* Remember + Forgot */}
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.checkRow}
              onPress={() => setRememberMe(v => !v)}
            >
              <View
                style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
              >
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rememberText}>Remember Me</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Button */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={onPressLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={styles.btnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>New on our platform? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Create an Account</Text>
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
  inputRow: { position: 'relative', marginBottom: spacing.base },
  inputFlex: { marginBottom: 0, paddingRight: 44 },
  eyeBtn: { position: 'absolute', right: spacing.md, top: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: spacing.radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
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
  rememberText: { fontSize: typography.sm, color: colors.textSecondary },
  forgotText: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.md,
    paddingVertical: spacing.base - 1,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  btnDisabled: { opacity: 0.7 },
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

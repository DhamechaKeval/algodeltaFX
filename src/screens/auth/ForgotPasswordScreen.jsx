// src/screens/auth/ForgotPasswordScreen.jsx

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

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);

  const handleSetPassword = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }
    Alert.alert(
      'Email Sent',
      'If this email is registered, you will receive a password reset OTP shortly.',
      [{ text: 'OK', onPress: () => navigation.navigate('Login') }],
    );
  };

  const content = (
    <ScrollView
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View style={styles.logoWrap}>
        <Image
          source={require('../../assets/algodeltafx_com_horizontal_logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View>
        <Text style={styles.title}>Set New Password</Text>
        <Text style={styles.subtitleSub}>
          Please create new password and verify with OTP.
        </Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[
            styles.input,
            focusedInput === 'email' && styles.inputFocused,
          ]}
          placeholder="Enter email"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setFocusedInput('email')}
          onBlur={() => setFocusedInput(null)}
        />

        <TouchableOpacity style={styles.btn} onPress={handleSetPassword}>
          <Text style={styles.btnText}>Set New Password</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backRow}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.backText}>← Back to Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView style={styles.flex} behavior="padding">
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </View>
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
  logoWrap: { alignItems: 'center', marginBottom: spacing.lg },
  logo: { width: 200, height: 60 },
  title: {
    fontSize: typography.xl,
    fontWeight: typography.extrabold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitleSub: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 18,
  },
  label: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.semibold,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: typography.md,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 1,

    elevation: 3,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  btnText: {
    fontSize: typography.base,
    fontWeight: typography.extrabold,
    color: colors.primaryText,
  },
  backRow: { alignItems: 'center' },
  backText: {
    fontSize: typography.sm + 1,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
});

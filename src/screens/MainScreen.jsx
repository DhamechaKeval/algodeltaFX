import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';

export default function MainScreen({ navigation }) {
  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Auth');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <Text style={styles.logo}>
        AlgoDelta<Text style={styles.logoAccent}>FX</Text>
      </Text>
      <Text style={styles.msg}>✅ Login Successful!</Text>
      <Text style={styles.sub}>Dashboard coming next...</Text>
      <TouchableOpacity style={styles.btn} onPress={handleLogout}>
        <Text style={styles.btnText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 32 },
  logoAccent: { color: colors.primary },
  msg: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  sub: { fontSize: 14, color: colors.textSecondary, marginBottom: 40 },
  btn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  btnText: { fontSize: 15, fontWeight: '800', color: colors.primaryText },
});

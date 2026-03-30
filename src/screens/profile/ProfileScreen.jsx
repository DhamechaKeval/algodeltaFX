import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const BASE_URL = 'https://api.algodeltafx.com/api/v1';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/users/getuserprofile`, {
        method: 'GET',
        headers: {
          Accept: '*/*',
          Authorization: token,
          Origin: 'https://www.algodeltafx.com',
          Referer: 'https://www.algodeltafx.com/',
        },
      });
      const data = await response.json();
      const p = data?.data || data?.user || data?.profile || data;
      setProfile(p);
    } catch (err) {
      console.log('Profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          navigation.replace('Auth');
        },
      },
    ]);
  };

  const Field = ({ label, value }) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldVal}>{value || '—'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <View style={styles.header}>
        <Image
          source={require('../../assets/algodeltafx_com_horizontal_logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.titleRow}>
        <Text style={styles.pageTitle}>Profile</Text>
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(profile?.full_name || profile?.name || profile?.email || 'U')
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>
            <Text style={styles.userName}>
              {profile?.full_name || profile?.name || '—'}
            </Text>
            <Text style={styles.userEmail}>{profile?.email || '—'}</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.fieldGrid}>
              <Field
                label="Full Name"
                value={profile?.full_name || profile?.name}
              />
              <Field
                label="Age Range"
                value={profile?.age_range || profile?.age}
              />
            </View>
            <View style={styles.fieldGrid}>
              <Field label="Country" value={profile?.country} />
              <Field label="State" value={profile?.state} />
            </View>
            <View style={styles.fieldGrid}>
              <Field label="City" value={profile?.city} />
              <Field label="Pincode" value={profile?.pincode || profile?.zip} />
            </View>
            <Field
              label="Mobile Number"
              value={
                profile?.mobile || profile?.phone || profile?.mobile_number
              }
            />
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logo: { width: 130, height: 36 },
  titleRow: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  pageTitle: {
    fontSize: typography.xl,
    fontWeight: typography.extrabold,
    color: colors.textPrimary,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing.base, paddingBottom: spacing.xxxl },
  avatarWrap: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.bgCard,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    fontSize: typography.xxxl,
    fontWeight: typography.extrabold,
    color: colors.primary,
  },
  userName: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: { fontSize: typography.sm, color: colors.textSecondary },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: spacing.radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  fieldGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  field: { flex: 1 },
  fieldLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    fontWeight: typography.semibold,
    marginBottom: 4,
  },
  fieldVal: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    fontSize: typography.sm,
    color: colors.textPrimary,
  },
  logoutBtn: {
    backgroundColor: colors.error,
    borderRadius: spacing.radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: '#fff',
  },
});

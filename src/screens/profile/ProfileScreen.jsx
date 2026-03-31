import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AppHeader from '../../components/common/AppHeader';
import Icon from '../../components/common/Icon';
import Button from '../../components/common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import {
  getUserProfile,
  updateUserProfile,
} from '../../services/profileService';
import { useAuth } from '../../hooks/useAuth';

const AGE_RANGES = ['18-30', '31-40', '41-50', '51-60', '60+'];

export default function ProfileScreen({ navigation }) {
  const { handleLogout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAge, setShowAge] = useState(false);

  const [fullName, setFullName] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState_] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const fillForm = d => {
    setFullName(d?.full_name || '');
    setAgeRange(d?.age_range || '');
    setCountry(d?.country || '');
    setState_(d?.state || '');
    setCity(d?.city || '');
    setPincode(String(d?.pincode || ''));
    setMobileNo(String(d?.mobile_no || ''));
    setImageUri(d?.profile_url || d?.profile || null);
  };

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getUserProfile();
      if (res?.status === true && res?.data) {
        setProfile(res.data);
        fillForm(res.data);
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handlePickImage = () => {
    if (!editing) return;
    launchImageLibrary(
      { mediaType: 'photo', maxWidth: 800, maxHeight: 800, quality: 0.8 },
      response => {
        if (response.didCancel || response.errorCode) return;
        const asset = response.assets?.[0];
        if (asset) {
          setImageUri(asset.uri);
          setImageFile(asset);
        }
      },
    );
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Full name is required.');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('full_name', fullName.trim());
      fd.append('state', state.trim());
      fd.append('city', city.trim());
      fd.append('age_range', ageRange);
      fd.append('pincode', pincode.trim());
      fd.append('mobile_no', mobileNo.trim());
      fd.append('country', country.trim());
      if (imageFile) {
        fd.append('profile', {
          uri: imageFile.uri,
          type: imageFile.type || 'image/jpeg',
          name: imageFile.fileName || 'profile.jpg',
        });
      }
      const res = await updateUserProfile(fd);
      if (res?.status === true) {
        Alert.alert('Success', 'Profile updated successfully!');
        setEditing(false);
        setImageFile(null);
        fetchProfile();
      } else {
        Alert.alert('Error', res?.message || 'Failed to update.');
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Network error.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) fillForm(profile);
    setImageFile(null);
    setEditing(false);
    setShowAge(false);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <AppHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          padding: spacing.base,
          paddingBottom: spacing.xxl,
        }}
      >
        <Text style={s.pageTitle}>Profile</Text>

        <View style={s.card}>
          <View>
            {/* ── Avatar Row ── */}
            <View style={s.avatarRow}>
              <TouchableOpacity
                onPress={handlePickImage}
                activeOpacity={editing ? 0.7 : 1}
                style={s.avatarWrap}
              >
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={s.avatar} />
                ) : (
                  <View style={s.avatarPlaceholder}>
                    <Icon
                      name="profile"
                      size={36}
                      color={colors.textMuted}
                      strokeWidth={1.2}
                    />
                  </View>
                )}
                {editing && (
                  <View style={s.avatarBadge}>
                    <Icon
                      name="plus"
                      size={12}
                      color={colors.primaryText}
                      strokeWidth={2.5}
                    />
                  </View>
                )}
              </TouchableOpacity>

              <View style={{ flex: 1, gap: spacing.xs }}>
                {editing && (
                  <TouchableOpacity
                    style={s.uploadBtn}
                    onPress={handlePickImage}
                  >
                    <Icon
                      name="download"
                      size={13}
                      color={colors.primaryText}
                      strokeWidth={2}
                    />
                    <Text style={s.uploadBtnTxt}>Upload Image</Text>
                  </TouchableOpacity>
                )}
                <Text style={s.uploadHint}>
                  Allowed JPG, JPEG or PNG. Max size of 1 MB
                </Text>
                {profile?.email && (
                  <Text style={s.emailTxt}>{profile.email}</Text>
                )}
              </View>
            </View>

            <View style={s.divider} />

            {/* ── Form ── */}

            {/* Full Name */}
            <Field label="Full Name">
              <TextInput
                style={[s.input, !editing && s.inputRO]}
                value={fullName}
                onChangeText={setFullName}
                editable={editing}
                placeholder="Enter Full Name"
                placeholderTextColor={colors.textPlaceholder}
              />
            </Field>

            {/* Age Range + Country */}
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Age Range</Text>
                <TouchableOpacity
                  style={[s.input, s.rowCenter, !editing && s.inputRO]}
                  onPress={() => editing && setShowAge(v => !v)}
                  activeOpacity={editing ? 0.7 : 1}
                >
                  <Text
                    style={[
                      s.inputTxt,
                      !ageRange && { color: colors.textPlaceholder },
                    ]}
                  >
                    {ageRange ? `${ageRange} years` : 'Select Age Range'}
                  </Text>
                  {editing && (
                    <Icon
                      name="chevron-down"
                      size={14}
                      color={colors.textSecondary}
                    />
                  )}
                </TouchableOpacity>
                {showAge && editing && (
                  <View style={s.dropdown}>
                    {AGE_RANGES.map((a, i) => (
                      <TouchableOpacity
                        key={a}
                        style={[
                          s.dropItem,
                          i === AGE_RANGES.length - 1 && {
                            borderBottomWidth: 0,
                          },
                          ageRange === a && s.dropActive,
                        ]}
                        onPress={() => {
                          setAgeRange(a);
                          setShowAge(false);
                        }}
                      >
                        <Text
                          style={[
                            s.dropTxt,
                            ageRange === a && { color: colors.primary },
                          ]}
                        >
                          {a} years
                        </Text>
                        {ageRange === a && (
                          <Icon
                            name="check"
                            size={14}
                            color={colors.primary}
                            strokeWidth={2.5}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Country">
                  <TextInput
                    style={[s.input, !editing && s.inputRO]}
                    value={country}
                    onChangeText={setCountry}
                    editable={editing}
                    placeholder="Country"
                    placeholderTextColor={colors.textPlaceholder}
                    autoCapitalize="characters"
                  />
                </Field>
              </View>
            </View>

            {/* State + City + Pincode */}
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Field label="State">
                  <TextInput
                    style={[s.input, !editing && s.inputRO]}
                    value={state}
                    onChangeText={setState_}
                    editable={editing}
                    placeholder="State"
                    placeholderTextColor={colors.textPlaceholder}
                    autoCapitalize="characters"
                  />
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="City">
                  <TextInput
                    style={[s.input, !editing && s.inputRO]}
                    value={city}
                    onChangeText={setCity}
                    editable={editing}
                    placeholder="City"
                    placeholderTextColor={colors.textPlaceholder}
                    autoCapitalize="characters"
                  />
                </Field>
              </View>
              <View style={{ flex: 0.8 }}>
                <Field label="Pincode">
                  <TextInput
                    style={[s.input, !editing && s.inputRO]}
                    value={pincode}
                    onChangeText={setPincode}
                    editable={editing}
                    placeholder="Pincode"
                    placeholderTextColor={colors.textPlaceholder}
                    keyboardType="numeric"
                  />
                </Field>
              </View>
            </View>

            {/* Mobile */}
            <Field label="Mobile Number">
              <View style={[s.input, s.mobileWrap, !editing && s.inputRO]}>
                <Text style={s.prefix}>+91</Text>
                <View style={s.prefixDivider} />
                <TextInput
                  style={s.mobileInput}
                  value={mobileNo}
                  onChangeText={setMobileNo}
                  editable={editing}
                  placeholder="Enter Mobile Number"
                  placeholderTextColor={colors.textPlaceholder}
                  keyboardType="phone-pad"
                />
              </View>
            </Field>

            {/* Edit / Save buttons */}
            <View style={{ marginTop: spacing.md, alignItems: 'flex-end' }}>
              {!editing ? (
                <TouchableOpacity
                  style={s.editBtn}
                  onPress={() => setEditing(true)}
                >
                  <Icon
                    name="settings"
                    size={16}
                    color={colors.primaryText}
                    strokeWidth={3}
                  />
                  <Text style={s.editBtnTxt}>Edit</Text>
                </TouchableOpacity>
              ) : (
                <View style={s.saveRow}>
                  <Button
                    label="Cancel"
                    variant="outline"
                    onPress={handleCancel}
                    style={{ flex: 1 }}
                  />
                  <Button
                    label="Save Changes"
                    variant="primary"
                    onPress={handleSave}
                    loading={saving}
                    style={{ flex: 1 }}
                  />
                </View>
              )}
            </View>
          </View>

          {/* Logout */}
          <TouchableOpacity
            style={s.logoutBtn}
            onPress={() =>
              Alert.alert('Logout', 'Are you sure you want to logout?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Logout',
                  style: 'destructive',
                  onPress: () => handleLogout(navigation),
                },
              ])
            }
          >
            <Icon
              name="logout"
              size={16}
              color={colors.error}
              strokeWidth={2}
            />
            <Text style={s.logoutTxt}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// Helper wrapper
function Field({ label, children }) {
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  pageTitle: {
    fontSize: typography.xl,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.base,
  },
  card: {
    flex: 1,
    justifyContent: 'space-between',
    //alignItems: 'flex-end',
    //   backgroundColor: colors.bgCard,
    //   borderRadius: spacing.radius.lg,
    //   padding: spacing.base,
    //   borderWidth: 1,
    //   borderColor: colors.border,
    //   marginBottom: spacing.base,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.base,
  },

  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.base },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: colors.border,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  uploadBtnTxt: {
    fontSize: typography.xs + 1,
    fontWeight: '700',
    color: colors.primaryText,
  },
  uploadHint: { fontSize: typography.xs + 2, color: colors.textMuted },
  emailTxt: { fontSize: typography.xs + 1, color: colors.textSecondary },

  label: {
    fontSize: typography.xs + 2,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.bgInput,
    borderWidth: 0.3,
    borderColor: colors.primary,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.sm,
    color: colors.textPrimary,
    marginBottom: 0,
  },
  inputRO: { borderColor: 'transparent', opacity: 0.8 },
  inputTxt: { flex: 1, fontSize: typography.sm, color: colors.textPrimary },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },

  dropdown: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    marginTop: 4,
    overflow: 'hidden',
    zIndex: 10,
  },
  dropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropActive: { backgroundColor: 'rgba(74,222,128,0.08)' },
  dropTxt: { fontSize: typography.sm, color: colors.textSecondary },

  mobileWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    overflow: 'hidden',
  },
  prefix: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: '600',
    paddingHorizontal: spacing.md,
  },
  prefixDivider: { width: 1, height: 20, backgroundColor: colors.border },
  mobileInput: {
    flex: 1,
    fontSize: typography.sm,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 6,
  },

  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  editBtnTxt: {
    fontSize: typography.base,
    fontWeight: '800',
    color: colors.primaryText,
  },
  saveRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
    borderRadius: spacing.radius.md,
    paddingVertical: spacing.md - 2,
    marginTop: spacing.xl,
  },
  logoutTxt: {
    fontSize: typography.base,
    fontWeight: '800',
    color: colors.error,
  },
});

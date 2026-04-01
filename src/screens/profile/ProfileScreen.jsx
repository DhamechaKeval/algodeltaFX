import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Modal,
  FlatList,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AppHeader from '../../components/common/AppHeader';
import Icon from '../../components/common/Icon';
import Button from '../../components/common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getCountries } from '../../services/profileService';
import {
  getUserProfile,
  updateUserProfile,
  getProfilePhotoUrl,
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
  const [showCountry, setShowCountry] = useState(false);
  const [countryQ, setCountryQ] = useState('');
  const [mobileLength, setMobileLength] = useState(null);
  const [countriesList, setCountriesList] = useState([]);
  const [countrySearchFocused, setCountrySearchFocused] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [selectedCountryObj, setSelectedCountryObj] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);

  const [fullName, setFullName] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [country, setCountry] = useState('');
  const [dialCode, setDialCode] = useState('+91');
  const [state, setState_] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Look up dial code from loaded countries list by country name
  const findDialCode = useCallback((countryName, list) => {
    if (!countryName || !list?.length) return '+91';
    const found = list.find(
      c => c?.name?.toUpperCase() === countryName?.toUpperCase(),
    );
    return found?.code || '+91';
  }, []);

  const fillForm = useCallback(
    (d, list) => {
      const cList = list || [];
      setFullName(d?.full_name || '');
      setAgeRange(d?.age_range || '');
      setCountry(d?.country || '');
      setDialCode(findDialCode(d?.country, cList));
      setState_(d?.state || '');
      setCity(d?.city || '');
      setPincode(String(d?.pincode || ''));
      setMobileNo(String(d?.mobile_no || ''));
      setImageUri(null);
    },
    [findDialCode],
  );

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      // Load countries + profile together so dial code lookup works
      const [res, url, cRes] = await Promise.all([
        getUserProfile(),
        getProfilePhotoUrl(),
        getCountries(),
      ]);
      const cList = Array.isArray(cRes?.data)
        ? cRes.data
        : Array.isArray(cRes)
        ? cRes
        : [];
      setCountriesList(cList);

      if (res?.status === true && res?.data) {
        setProfile(res.data);
        fillForm(res.data, cList); // pass list so dial code is resolved immediately
      }
      if (url) setPhotoUrl(url);
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, [fillForm]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ── Country selected → clear location fields + update dial code ──
  const handleSelectCountry = c => {
    setSelectedCountryObj(c); // save full object
    setCountry(getCName(c));
    setDialCode(getCDial(c));
    setMobileLength(Number(c?.mobile_no_length) || null);
    // Auto-clear location fields on country change
    setState_('');
    setCity('');
    setPincode('');
    setMobileNo('');
    setShowCountry(false);
    setCountryQ('');
  };

  // Get display name from API country object
  // API: { name, code, mobile_no_length }
  const getCName = c => c?.name || '';
  const getCDial = c => c?.code || '+91';

  const filteredCountries = countryQ.trim()
    ? countriesList.filter(c =>
        getCName(c).toLowerCase().includes(countryQ.toLowerCase()),
      )
    : countriesList;

  // ── Pick image ────────────────────────────────────────────────
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

  // ── Save ──────────────────────────────────────────────────────
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
      fd.append('country', country.trim().toUpperCase());
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
    if (profile) fillForm(profile, countriesList);
    setImageFile(null);
    setEditing(false);
    setShowAge(false);
    setShowCountry(false);
  };

  // Display image: picked > photoUrl
  const displayImage = imageUri || photoUrl;

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
          paddingInline: spacing.base,
          paddingBlock: spacing.sm + 2,
        }}
      >
        <View style={s.card}>
          {/* ── Avatar ── */}
          <View style={s.avatarRow}>
            <TouchableOpacity
              onPress={handlePickImage}
              activeOpacity={editing ? 0.7 : 1}
              style={s.avatarWrap}
            >
              {displayImage ? (
                <Image
                  source={{ uri: displayImage }}
                  style={s.avatar}
                  onError={() => setPhotoUrl(null)}
                />
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
                <TouchableOpacity style={s.uploadBtn} onPress={handlePickImage}>
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

          {/* Age Range + Country (same row) */}
          <View style={s.row}>
            {/* Age Range */}
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
                <View style={s.inlineDropdown}>
                  {AGE_RANGES.map((a, i) => (
                    <TouchableOpacity
                      key={a}
                      style={[
                        s.dropItem,
                        i === AGE_RANGES.length - 1 && { borderBottomWidth: 0 },
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

            {/* Country — opens full modal */}
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Country</Text>
              <TouchableOpacity
                style={[s.input, s.rowCenter, !editing && s.inputRO]}
                onPress={() => editing && setShowCountry(true)}
                activeOpacity={editing ? 0.7 : 1}
              >
                <Text
                  style={[
                    s.inputTxt,
                    !country && { color: colors.textPlaceholder },
                  ]}
                >
                  {country || 'Select Country'}
                </Text>
                {editing && (
                  <Icon
                    name="chevron-down"
                    size={14}
                    color={colors.textSecondary}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* State + City + Pincode */}
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Field label="State">
                <TextInput
                  style={[
                    s.input,
                    !editing && s.inputRO,
                    editing && focusedField === 'state' && s.inputFocused,
                  ]}
                  value={state}
                  onChangeText={setState_}
                  editable={editing}
                  placeholder="State"
                  placeholderTextColor={colors.textPlaceholder}
                  autoCapitalize="characters"
                  onFocus={() => setFocusedField('state')}
                  onBlur={() => setFocusedField(null)}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="City">
                <TextInput
                  style={[
                    s.input,
                    !editing && s.inputRO,
                    editing && focusedField === 'city' && s.inputFocused,
                  ]}
                  value={city}
                  onChangeText={setCity}
                  editable={editing}
                  placeholder="City"
                  placeholderTextColor={colors.textPlaceholder}
                  autoCapitalize="characters"
                  onFocus={() => setFocusedField('city')}
                  onBlur={() => setFocusedField(null)}
                />
              </Field>
            </View>
            <View style={{ flex: 0.8 }}>
              <Field label="Pincode">
                <TextInput
                  style={[
                    s.input,
                    !editing && s.inputRO,
                    editing && focusedField === 'pincode' && s.inputFocused,
                  ]}
                  value={pincode}
                  onChangeText={setPincode}
                  editable={editing}
                  placeholder="000000"
                  placeholderTextColor={colors.textPlaceholder}
                  keyboardType="numeric"
                  onFocus={() => setFocusedField('pincode')}
                  onBlur={() => setFocusedField(null)}
                />
              </Field>
            </View>
          </View>

          {/* Mobile Number with dynamic dial code */}
          <Field label="Mobile Number">
            <View style={[s.input, s.mobileWrap, !editing && s.inputRO]}>
              <Text style={s.prefix}>{dialCode}</Text>
              <View style={s.prefixDivider} />
              <TextInput
                style={s.mobileInput}
                value={mobileNo}
                onChangeText={text => {
                  const found = countriesList.find(
                    c => c?.name?.toUpperCase() === country?.toUpperCase(),
                  );
                  const maxLen = found?.mobile_no_length
                    ? Number(found.mobile_no_length)
                    : 15;
                  if (text.length <= maxLen) setMobileNo(text);
                }}
                editable={editing}
                placeholder={(() => {
                  const found = countriesList.find(
                    c => c?.name?.toUpperCase() === country?.toUpperCase(),
                  );
                  return found?.mobile_no_length
                    ? `${found.mobile_no_length} digits`
                    : 'Enter Mobile Number';
                })()}
                placeholderTextColor={colors.textPlaceholder}
                keyboardType="phone-pad"
                maxLength={(() => {
                  const found = countriesList.find(
                    c => c?.name?.toUpperCase() === country?.toUpperCase(),
                  );
                  return found?.mobile_no_length
                    ? Number(found.mobile_no_length)
                    : 15;
                })()}
                onFocus={() => setFocusedField('mobile')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </Field>

          {/* Edit / Save */}
          <View style={{ marginTop: spacing.md, alignItems: 'flex-end' }}>
            {!editing ? (
              <TouchableOpacity
                style={s.editBtn}
                onPress={() => setEditing(true)}
              >
                <Icon
                  name="settings"
                  size={14}
                  color={colors.primaryText}
                  strokeWidth={2}
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
                  style={{ flex: 1.5 }}
                />
              </View>
            )}
          </View>
        </View>

        {/* Spacer pushes logout to bottom */}
        <View style={{ flex: 1, minHeight: spacing.xxl }} />

        {/* Logout — always at bottom */}
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
          <Icon name="logout" size={16} color={colors.error} strokeWidth={2} />
          <Text style={s.logoutTxt}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Country Picker Modal ── */}
      <Modal
        visible={showCountry}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountry(false)}
      >
        <View style={cm.overlay}>
          <View style={cm.sheet}>
            <View style={cm.header}>
              <Text style={cm.title}>Select Country</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCountry(false);
                  setCountryQ('');
                }}
              >
                <Icon
                  name="x"
                  size={20}
                  color={colors.textSecondary}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View
              style={[
                cm.searchBox,
                countrySearchFocused && { borderColor: colors.primary },
              ]}
            >
              <Icon
                name="search"
                size={14}
                color={colors.textMuted}
                strokeWidth={1.8}
              />
              <TextInput
                style={cm.searchInput}
                placeholder="Search country..."
                placeholderTextColor={colors.textPlaceholder}
                value={countryQ}
                onChangeText={setCountryQ}
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setCountrySearchFocused(true)}
                onBlur={() => setCountrySearchFocused(false)}
              />
              {countryQ.length > 0 && (
                <TouchableOpacity onPress={() => setCountryQ('')}>
                  <Icon
                    name="x"
                    size={13}
                    color={colors.textMuted}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredCountries}
              keyExtractor={item => item?.name || String(Math.random())}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const name = getCName(item);
                const dial = getCDial(item);
                const selected = country.toUpperCase() === name.toUpperCase();
                return (
                  <TouchableOpacity
                    style={[cm.countryItem, selected && cm.countryActive]}
                    onPress={() => handleSelectCountry(item)}
                  >
                    <Text
                      style={[
                        cm.countryName,
                        selected && {
                          color: colors.primary,
                          fontWeight: '700',
                        },
                      ]}
                    >
                      {name}
                    </Text>
                    <Text style={cm.dialCode}>{dial}</Text>
                    {selected && (
                      <Icon
                        name="check"
                        size={16}
                        color={colors.primary}
                        strokeWidth={2.5}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Field({ label, children }) {
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  card: { marginBottom: spacing.base },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.base,
  },

  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.base },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  },
  uploadBtnTxt: {
    fontSize: typography.xs + 1,
    fontWeight: '700',
    color: colors.primaryText,
  },
  uploadHint: { fontSize: typography.xs, color: colors.textMuted },
  emailTxt: { fontSize: typography.xs + 1, color: colors.textSecondary },

  label: {
    fontSize: typography.xs + 1,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.bgInput,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.sm,
    color: colors.textPrimary,
  },
  inputRO: { borderColor: 'transparent', opacity: 0.85 },
  inputFocused: { borderColor: colors.primary, borderWidth: 1 },
  inputTxt: { flex: 1, fontSize: typography.sm, color: colors.textPrimary },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },

  inlineDropdown: {
    backgroundColor: colors.bgCard,
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
    fontWeight: '700',
    paddingHorizontal: spacing.md,
    minWidth: 52,
  },
  prefixDivider: { width: 1, height: 20, backgroundColor: colors.border },
  mobileInput: {
    flex: 1,
    fontSize: typography.sm,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: 0,
  },

  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  editBtnTxt: {
    fontSize: typography.sm,
    fontWeight: '700',
    color: colors.primaryText,
  },
  saveRow: { flexDirection: 'row', gap: spacing.md, width: '100%' },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
    borderRadius: spacing.radius.md,
    paddingVertical: spacing.md,
  },
  logoutTxt: {
    fontSize: typography.md,
    fontWeight: '700',
    color: colors.error,
  },
});

// Country Modal styles
const cm = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    marginHorizontal: spacing.base,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sm,
    color: colors.textPrimary,
    padding: 0,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  countryActive: { backgroundColor: 'rgba(74,222,128,0.06)' },
  countryName: { flex: 1, fontSize: typography.md, color: colors.textPrimary },
  dialCode: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginRight: spacing.sm,
    fontWeight: '600',
  },
});

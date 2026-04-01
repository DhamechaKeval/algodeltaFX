import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api.algodeltafx.com/api/v1';
const PROFILE_IMG = 'https://api.algodeltafx.com/user_profiles';

const getToken = async () => await AsyncStorage.getItem('token');

// ── Decode user_id from JWT ───────────────────────────────────────
export const getUserIdFromToken = async () => {
  try {
    const token = await getToken();
    if (!token) return null;
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded?.user_id || null;
  } catch {
    return null;
  }
};

// ── Profile photo URL ─────────────────────────────────────────────
export const getProfilePhotoUrl = async () => {
  const userId = await getUserIdFromToken();
  if (!userId) return null;
  return `${PROFILE_IMG}/${userId}.jpg?${Date.now()}`;
};

// ── GET user profile ──────────────────────────────────────────────
export const getUserProfile = async () => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/users/getuserprofile`, {
    method: 'GET',
    headers: { Authorization: token, Accept: '*/*' },
  });
  return res.json();
};

// ── UPDATE user profile (multipart/form-data) ─────────────────────
export const updateUserProfile = async formData => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/users/updateuserprofile`, {
    method: 'POST',
    headers: { Authorization: token, Accept: '*/*' },
    body: formData,
  });
  return res.json();
};

// ── Get countries list (used in Profile + Wallet) ─────────────────
export const getCountries = async () => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/users/getcountries`, {
    method: 'GET',
    headers: { Authorization: token, Accept: '*/*' },
  });
  return res.json();
};

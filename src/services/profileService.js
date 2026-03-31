import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api.algodeltafx.com/api/v1';

const getToken = async () => await AsyncStorage.getItem('token');

// ── GET user profile ──────────────────────────────────────────────
export const getUserProfile = async () => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/users/getuserprofile`, {
    method: 'GET',
    headers: {
      Authorization: token,
      Accept: '*/*',
    },
  });
  return res.json();
};

// ── UPDATE user profile (multipart/form-data) ─────────────────────
// Fields: full_name, state, city, age_range, pincode, mobile_no, country, profile (image)
export const updateUserProfile = async formData => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/users/updateuserprofile`, {
    method: 'POST',
    headers: {
      Authorization: token,
      Accept: '*/*',
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });
  return res.json();
};
